import { createHash } from 'node:crypto';
import { normalizeUserId } from './auth.js';
import { getClientIp } from './request-security.js';
import { supabase } from './supabase-admin.js';

const LOGIN_FAILURE_STALE_MS = 60 * 60 * 1000;
const LOGIN_LOCKOUT_MS = 5 * 60 * 1000;

export function userThrottleKey(username) {
  return createHash('sha256')
    .update(`login-user\n${normalizeUserId(username)}`)
    .digest('hex')
    .slice(0, 32);
}

export function ipThrottleKey(ip) {
  return createHash('sha256')
    .update(`login-ip\n${String(ip || 'unknown').slice(0, 120)}`)
    .digest('hex')
    .slice(0, 32);
}

export function throttleKeys(username, ipOrReq) {
  const ip = typeof ipOrReq === 'string' ? ipOrReq : getClientIp(ipOrReq);
  return {
    userKey: userThrottleKey(username),
    ipKey: ipThrottleKey(ip)
  };
}

export async function getAppSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('data,settings')
    .eq('id', 'true')
    .maybeSingle();

  if (error) throw error;

  return {
    ...(data?.data && typeof data.data === 'object' ? data.data : {}),
    ...(data?.settings && typeof data.settings === 'object' ? data.settings : {})
  };
}

export async function saveAppSettings(settings) {
  const payload = settings && typeof settings === 'object' ? settings : {};
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        id: 'true',
        data: payload,
        settings: payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (error) throw error;
}

export function pruneLoginFailures(rawFailures, nowMs = Date.now()) {
  const next = {};
  if (!rawFailures || typeof rawFailures !== 'object') return next;
  const staleCutoff = nowMs - LOGIN_FAILURE_STALE_MS;
  for (const [key, value] of Object.entries(rawFailures)) {
    if (!value || typeof value !== 'object') continue;
    const until = Number(value.until || 0);
    const updatedMs = Date.parse(String(value.updatedAt || '')) || 0;
    if (until > nowMs || updatedMs > staleCutoff) {
      next[key] = value;
    }
  }
  return next;
}

export function isThrottledInSettings(settings, keys, nowMs = Date.now()) {
  const failures = settings?.loginFailures;
  if (!failures || typeof failures !== 'object') return false;
  return (
    Number(failures[keys.userKey]?.until || 0) > nowMs ||
    Number(failures[keys.ipKey]?.until || 0) > nowMs
  );
}

export async function isLoginThrottled(keys) {
  const settings = await getAppSettings();
  return isThrottledInSettings(settings, keys);
}

export async function recordLoginFailures(keysOrEntries, kindPrefix = '') {
  const settings = await getAppSettings();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const loginFailures = pruneLoginFailures(settings?.loginFailures, nowMs);

  const entries = Array.isArray(keysOrEntries)
    ? keysOrEntries
    : [
        { key: keysOrEntries?.userKey, kind: kindPrefix ? `${kindPrefix}-user` : 'user', lockAfter: 5 },
        { key: keysOrEntries?.ipKey, kind: kindPrefix ? `${kindPrefix}-ip` : 'ip', lockAfter: 20 }
      ];

  for (const { key, kind, lockAfter } of entries) {
    if (!key) continue;
    const current = loginFailures[key] && typeof loginFailures[key] === 'object' ? loginFailures[key] : {};
    const count = Number(current.count || 0) + 1;
    loginFailures[key] = {
      count,
      until: count >= lockAfter ? nowMs + LOGIN_LOCKOUT_MS : 0,
      kind,
      updatedAt: nowIso
    };
  }

  await saveAppSettings({
    ...settings,
    loginFailures
  });
}

export async function clearLoginFailures(keys) {
  const list = Array.isArray(keys) ? keys : [keys?.userKey, keys?.ipKey];
  const settings = await getAppSettings();
  if (!settings?.loginFailures || typeof settings.loginFailures !== 'object') return;
  const loginFailures = { ...settings.loginFailures };
  let changed = false;
  for (const key of list) {
    if (key && Object.prototype.hasOwnProperty.call(loginFailures, key)) {
      delete loginFailures[key];
      changed = true;
    }
  }
  if (!changed) return;
  await saveAppSettings({
    ...settings,
    loginFailures
  });
}
