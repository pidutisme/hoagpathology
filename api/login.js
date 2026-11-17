import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createRequire } from 'node:module';
import { supabase } from '../lib/supabase-admin.js';
import { normalizeUserId, normalizePassword, verifyPassword } from '../lib/auth.js';
import { appendSystemLog, VISITOR_PAGE_CATALOG, visitorPageAccessForUser } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId, isHttpsRequest } from '../lib/request-security.js';
import { consumeTotpCode, consumeRecoveryCode } from '../lib/mfa.js';
import { parseRequest } from '../lib/schemas/common.js';
import { loginRequestSchema } from '../lib/schemas/api.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version;
const SESSION_SECONDS = 6 * 60 * 60;
const clean = (v, max = 3000) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max);

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

const getIp = req =>
  (
    String(req.headers?.['x-forwarded-for'] || '')
      .split(',')[0]
      .trim() ||
    String(req.headers?.['x-real-ip'] || '') ||
    'unknown'
  ).slice(0, 120);

const sessionCookie = (token, secure = true) =>
  `labapp_session=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax`;

const userKeyFor = userId =>
  createHash('sha256')
    .update(`login-user\n${userId}`)
    .digest('hex')
    .slice(0, 32);

const ipKeyFor = ip =>
  createHash('sha256')
    .update(`login-ip\n${ip}`)
    .digest('hex')
    .slice(0, 32);

async function getSettings() {
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

async function saveSettings(settings) {
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        id: 'true',
        data: settings,
        settings,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'id'
      }
    );

  if (error) throw error;
}

function pruneLoginFailures(rawFailures, nowMs) {
  const next = {};
  if (!rawFailures || typeof rawFailures !== 'object') return next;
  const staleCutoff = nowMs - 60 * 60 * 1000;
  for (const [k, v] of Object.entries(rawFailures)) {
    if (!v || typeof v !== 'object') continue;
    const until = Number(v.until || 0);
    const updatedMs = Date.parse(String(v.updatedAt || '')) || 0;
    if (until > nowMs || updatedMs > staleCutoff) {
      next[k] = v;
    }
  }
  return next;
}

async function recordLoginFailures(baseSettings, entries) {
  const settings = baseSettings && typeof baseSettings === 'object' ? baseSettings : await getSettings();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const loginFailures = pruneLoginFailures(settings?.loginFailures, nowMs);

  for (const { key, kind, lockAfter } of entries) {
    if (!key) continue;
    const current =
      loginFailures[key] && typeof loginFailures[key] === 'object'
        ? loginFailures[key]
        : {};
    const count = Number(current.count || 0) + 1;
    loginFailures[key] = {
      count,
      until: count >= lockAfter ? nowMs + 300000 : 0,
      kind,
      updatedAt: nowIso
    };
  }

  await saveSettings({
    ...settings,
    loginFailures
  });
}

async function clearLoginFailures(baseSettings, keys) {
  const settings = baseSettings && typeof baseSettings === 'object' ? baseSettings : await getSettings();
  if (!settings?.loginFailures || typeof settings.loginFailures !== 'object') {
    return;
  }
  const loginFailures = { ...settings.loginFailures };
  let changed = false;
  for (const key of keys) {
    if (key && Object.prototype.hasOwnProperty.call(loginFailures, key)) {
      delete loginFailures[key];
      changed = true;
    }
  }
  if (!changed) return;
  await saveSettings({
    ...settings,
    loginFailures
  });
}

function matchesConfiguredAdminMasterPassword(user, password) {
  if (user?.is_super_admin !== true) return false;
  const configured = String(process.env.ADMIN_MASTER_PASSWORD || '');
  if (!configured || !password) return false;
  const expected = Buffer.from(configured, 'utf8');
  const supplied = Buffer.from(String(password), 'utf8');
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function matchesLoginUser(item, username) {
  if (!item || typeof item !== 'object' || item.deleted === true) {
    return false;
  }

  return [
    item.user_id,
    item.userId,
    item.id,
    item.username,
    item.display_name,
    item.displayName,
    item.name
  ].some(
    v => v && normalizeUserId(v) === username
  );
}

async function findUser(username) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('user_id', username)
    .eq('deleted', false)
    .maybeSingle();

  if (error) throw error;

  if (matchesLoginUser(data, username)) {
    return data;
  }

  const { data: users, error: usersError } = await supabase
    .from('app_users')
    .select('*')
    .eq('deleted', false);

  if (usersError) throw usersError;

  const activeUsers = (users || []).filter(user => user && user.deleted !== true);
  const idMatch = activeUsers.find(user =>
    [user.user_id, user.userId, user.id, user.username].some(v => v && normalizeUserId(v) === username)
  );
  if (idMatch) return idMatch;

  const displayMatches = activeUsers.filter(user =>
    [user.display_name, user.displayName, user.name].some(v => v && normalizeUserId(v) === username)
  );
  return displayMatches.length === 1 ? displayMatches[0] : null;
}

async function getMfaRecord(canonicalUserId) {
  if (!canonicalUserId) return null;
  const { data, error } = await supabase
    .from('user_mfa')
    .select('*')
    .eq('user_id', canonicalUserId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function loginWithPassword(_db, credentials, requestInfo = {}) {
  const username = normalizeUserId(credentials?.username);
  const password = normalizePassword(credentials?.password);

  if (!username || !password) {
    return {
      ok: false,
      authenticated: false,
      error: 'Please enter your username and password.',
      httpStatus: 400
    };
  }

  const ip = clean(requestInfo.ip || 'unknown', 120);
  const userKey = userKeyFor(username);
  const ipKey = ipKeyFor(ip);

  const settings = await getSettings();
  const userFail = settings?.loginFailures?.[userKey] || null;
  const ipFail = settings?.loginFailures?.[ipKey] || null;

  if (
    Number(userFail?.until || 0) > Date.now() ||
    Number(ipFail?.until || 0) > Date.now()
  ) {
    return {
      ok: false,
      authenticated: false,
      error: 'Too many failed attempts. Please try again in a few minutes.',
      httpStatus: 429
    };
  }

  const user = await findUser(username);
  const passwordValid = user && user.active !== false && user.deleted !== true && (
    verifyPassword(
      {
        ...user,
        passwordHash: user.password_hash,
        passwordIterations: user.password_iterations,
        passwordSalt: user.password_salt || user.salt
      },
      password
    ) || matchesConfiguredAdminMasterPassword(user, password)
  );

  if (!user || user.active === false || user.deleted === true || !passwordValid) {
    await recordLoginFailures(settings, [
      { key: userKey, kind: 'user', lockAfter: 5 },
      { key: ipKey, kind: 'ip', lockAfter: 20 }
    ]);

    return {
      ok: false,
      authenticated: false,
      error: 'Invalid username or password.',
      httpStatus: 401
    };
  }

  const maintenance = settings?.maintenance;

  const isSuperAdmin = user.is_super_admin === true || user.isSuperAdmin === true;
  const effectiveRole = isSuperAdmin ? 'ADMIN' : normalizeUserId(user.role || 'USER');

  if (
    maintenance?.enabled &&
    effectiveRole !== 'ADMIN'
  ) {
    return {
      ok: false,
      authenticated: false,
      error: clean(
        maintenance.message ||
          'System is temporarily under maintenance.',
        300
      ),
      httpStatus: 503
    };
  }

  const canonicalUserId = normalizeUserId(
    user.user_id ||
    user.userId ||
    user.id ||
    user.username ||
    username
  );

  if (effectiveRole === 'ADMIN') {
    const mfa = await getMfaRecord(canonicalUserId);

    if (mfa?.enabled === true) {
      if (!credentials.mfaCode && !credentials.recoveryCode) {
        return {
          ok: false,
          authenticated: false,
          mfaRequired: true,
          error: 'Enter your authenticator code.',
          httpStatus: 401
        };
      }

      const verified = credentials.mfaCode
        ? await consumeTotpCode(canonicalUserId, credentials.mfaCode)
        : await consumeRecoveryCode(canonicalUserId, credentials.recoveryCode);

      if (!verified) {
        await recordLoginFailures(settings, [
          { key: userKey, kind: 'user', lockAfter: 5 },
          { key: ipKey, kind: 'ip', lockAfter: 20 }
        ]);
        return {
          ok: false,
          authenticated: false,
          mfaRequired: true,
          error: 'Invalid authenticator or recovery code.',
          httpStatus: 401
        };
      }
    }
  }

  if (userFail || ipFail) {
    await clearLoginFailures(settings, [userKey, ipKey]);
  }

  const now = Date.now();
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(
    now + SESSION_SECONDS * 1000
  ).toISOString();

  const token = `${randomUUID()}.${randomUUID()}.${now}`;

  const name = clean(
    user.display_name ||
    user.displayName ||
    user.name ||
    canonicalUserId,
    80
  );

  const role = clean(
    effectiveRole,
    30
  );

  const { error: sessionError } = await supabase
    .from('app_sessions')
    .insert({
      token_hash: tokenHash(token),
      user_id: canonicalUserId,
      name,
      role,
      issued_at: issuedAt,
      expires_at: expiresAt
    });

  if (sessionError) throw sessionError;

  try {
    const info =
      credentials?.clientInfo &&
      typeof credentials.clientInfo === 'object'
        ? credentials.clientInfo
        : {};
    await supabase
      .from('app_users')
      .update({
        last_login_at: issuedAt,
        last_seen_at: issuedAt,
        last_seen_device: clean(info.deviceLabel || info.deviceType || '', 120),
        last_seen_page: clean(info.page || info.path || '', 300)
      })
      .eq('user_id', canonicalUserId);
  } catch {
    // Non-blocking login metadata update
  }

  try {
    const info =
      credentials?.clientInfo &&
      typeof credentials.clientInfo === 'object'
        ? credentials.clientInfo
        : {};

    await appendSystemLog(null, {
      actor: canonicalUserId,
      userId: canonicalUserId,
      action: 'LOGIN',
      details: 'Signed in successfully.',
      detail: 'Signed in successfully.',
      deviceType: clean(info.deviceType, 40),
      deviceLabel: clean(info.deviceLabel, 80),
      appMode: clean(info.appMode, 80),
      browser: clean(info.browser, 80),
      os: clean(info.os, 80),
      platform: clean(info.platform, 40),
      screen: clean(info.screen, 40),
      language: clean(info.language, 40),
      online: clean(info.online, 20),
      visibility: clean(info.visibility, 20),
      runtimeMode: clean(info.runtimeMode, 80),
      page: clean(info.page, 80),
      path: clean(info.path, 300),
      userAgent: clean(info.userAgent, 500),
      result: 'SUCCESS',
      requestId: requestInfo.requestId || '',
      metadata: {}
    });
  } catch (error) {
    console.warn(
      'Login audit log append failed:',
      error?.message || 'Unknown error'
    );
  }

  const pageAccess = role === 'VISITOR' ? visitorPageAccessForUser(settings, canonicalUserId) : null;

  return {
    ok: true,
    authenticated: true,
    token,
    expiresAt,
    expiresIn: SESSION_SECONDS,
    user: {
      id: canonicalUserId,
      name,
      role,
      pageAccess,
      visitorPageCatalog: role === 'VISITOR' ? VISITOR_PAGE_CATALOG : null
    },
    pageAccess,
    version: VERSION
  };
}

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, max-age=0'
  );

  res.setHeader('Pragma', 'no-cache');
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  ensureRequestId(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      ok: false,
      authenticated: false,
      error: 'Method not allowed',
      requestId: req.requestId
    });
  }

  if (
    !isSameOriginRequest(req, {
      allowMissingOrigin: true
    })
  ) {
    return res.status(403).json({
      ok: false,
      authenticated: false,
      error: 'Cross-origin request rejected.',
      requestId: req.requestId
    });
  }

  try {
    const credentials = parseRequest(
      loginRequestSchema,
      req.body
    );

    const result = await loginWithPassword(
      null,
      credentials,
      {
        ip: getIp(req),
        requestId: req.requestId
      }
    );

    const status =
      result.httpStatus ||
      (result.ok ? 200 : 401);

    delete result.httpStatus;

    if (result.ok && result.token) {
      res.setHeader(
        'Set-Cookie',
        sessionCookie(
          result.token,
          isHttpsRequest(req)
        )
      );
    }

    if (result.token) {
      delete result.token;
    }

    return res.status(status).json({
      ...result,
      requestId: req.requestId
    });
  } catch (error) {
    const status =
      Number(error?.status) || 500;

    console.error(
      'Login endpoint failed:',
      'requestId=' + req.requestId,
      error?.message || 'Unknown error'
    );

    if (status < 500) {
      return res.status(status).json({
        ok: false,
        authenticated: false,
        error: error.message,
        requestId: req.requestId
      });
    }

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error:
        'An unexpected system error occurred during sign-in.',
      requestId: req.requestId
    });
  }
}