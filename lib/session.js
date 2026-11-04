import { createHash, randomUUID } from 'node:crypto';
import { normalizeUserId } from './auth.js';
import { supabase } from './supabase-admin.js';

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

const cache = new Map();
const CACHE_TTL_MS = 3000;

async function readCached(key, loader) {
  const hit = cache.get(key);

  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.val;
  }

  const val = await loader();
  cache.set(key, { at: Date.now(), val });
  return val;
}

function matchesUser(u, targetId) {
  if (!u || typeof u !== 'object' || u.deleted === true) return false;

  return [
    u.user_id,
    u.userId,
    u.id,
    u.username,
    u.display_name,
    u.displayName,
    u.name
  ].some(
    v => v && normalizeUserId(v) === targetId
  );
}

export async function sessionFor(_db, token) {
  token = String(token || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 300);

  if (!token) return null;

  const hash = tokenHash(token);

  const { data: session, error: sessionError } = await supabase
    .from('app_sessions')
    .select('*')
    .eq('token_hash', hash)
    .maybeSingle();

  if (sessionError) throw sessionError;

  const expiresAt = Date.parse(session?.expires_at);
  const issuedAt = Date.parse(session?.issued_at);

  if (
    !session ||
    !session.user_id ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now() ||
    !Number.isFinite(issuedAt)
  ) {
    return null;
  }

  const targetUserId = normalizeUserId(session.user_id);

  const user = await readCached(
    `user:${targetUserId}`,
    async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  );

  if (!matchesUser(user, targetUserId)) return null;

  if (
    user.active === false ||
    (
      Date.parse(user.sessions_revoked_at || '') > 0 &&
      Date.parse(user.sessions_revoked_at) >= issuedAt
    )
  ) {
    return null;
  }

  const role = user.is_super_admin === true || user.isSuperAdmin === true
    ? 'ADMIN'
    : normalizeUserId(user.role || session.role || 'USER');

  if (role !== 'ADMIN') {
    const settings = await readCached(
      'settings',
      async () => {
        const { data, error } = await supabase
          .from('app_settings')
          .select('settings')
          .eq('id', 'true')
          .maybeSingle();

        if (error) throw error;
        return data?.settings || {};
      }
    );

    if (settings?.maintenance?.enabled) {
      return null;
    }
  }

  const canonicalId = normalizeUserId(
    user.user_id ||
    user.userId ||
    user.id ||
    user.username ||
    targetUserId
  );

  return {
    token,
    session: {
      userId: session.user_id,
      name: session.name,
      role: session.role,
      issuedAt: session.issued_at,
      expiresAt: session.expires_at
    },
    user: {
      ...user,
      userId: canonicalId,
      displayName: user.display_name
    },
    userId: canonicalId,
    role
  };
}

export async function appendSystemLog(_db, entry) {
  const at = String(
    entry?.at || new Date().toISOString()
  );

  const data = {
    ...entry,
    at
  };

  const { error } = await supabase
    .from('system_logs')
    .insert({
      id: randomUUID(),
      data,
      created_at: at
    });

  if (error) throw error;

  return true;
}