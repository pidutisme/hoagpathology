import { createHash, randomUUID } from 'node:crypto';
import { normalizeUserId } from './auth.js';
import { supabase } from './supabase-admin.js';

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

const cache = new Map();
const CACHE_TTL_MS = 3000;

/* Visitor page access is stored in app_settings so no schema/table migration is
 * required. These are the existing navigable pages/modules; no new page is
 * introduced by this feature. */
export const VISITOR_PAGE_CATALOG = Object.freeze([
  Object.freeze({ id: 'dashboard', label: 'DASHBOARD' }),
  Object.freeze({ id: 'profile', label: 'PROFILE' }),
  Object.freeze({ id: 'access', label: 'ACCESS' }),
  Object.freeze({ id: 'calendar', label: 'CALENDAR' }),
  Object.freeze({ id: 'notification', label: 'NOTIFICATION' }),
  Object.freeze({ id: 'leavesCourses', label: 'LEAVE & COURSES' }),
  Object.freeze({ id: 'quickLinks', label: 'QUICK LINKS' }),
  Object.freeze({ id: 'settings', label: 'SETTING' }),
  Object.freeze({ id: 'OUTSOURCE', label: 'OUTSOURCE' }),
  Object.freeze({ id: 'INVENTORY', label: 'INVENTORY' }),
  Object.freeze({ id: 'TRANSFUSION', label: 'TRANSFUSION' }),
  Object.freeze({ id: 'POCT', label: 'POCT' }),
  Object.freeze({ id: 'Chemical Pathology', label: 'CHEMICAL PATHOLOGY' }),
  Object.freeze({ id: 'Hematology', label: 'HEMATOLOGY' }),
  Object.freeze({ id: 'Microbiology', label: 'MICROBIOLOGY' }),
  Object.freeze({ id: 'Urine/Stool Analysis', label: 'URINE/STOOL ANALYSIS' })
]);

const VISITOR_PAGE_IDS = new Set(VISITOR_PAGE_CATALOG.map(item => item.id));
const VISITOR_PAGE_ID_BY_KEY = new Map(
  VISITOR_PAGE_CATALOG.map(item => [String(item.id).trim().toLowerCase(), item.id])
);

function normalizeVisitorAccessList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map(item => {
        const key = String(item == null ? '' : item).trim().toLowerCase();
        return VISITOR_PAGE_ID_BY_KEY.get(key) || '';
      })
      .filter(item => VISITOR_PAGE_IDS.has(item))
  )];
}

export function visitorPageAccessForUser(settings, userId) {
  const settingsObject = settings && typeof settings === 'object' ? settings : {};
  const mapping = settingsObject.visitorPageAccess;
  const id = normalizeUserId(userId);

  /* No saved assignment grants no content page. Dashboard remains the
   * application shell; every other page/module stays disabled until an
   * administrator explicitly assigns it. */
  if (!mapping || typeof mapping !== 'object' || !Object.prototype.hasOwnProperty.call(mapping, id)) {
    return ['dashboard'];
  }

  const selected = normalizeVisitorAccessList(mapping[id]);
  /* Dashboard is the navigation shell for module cards. If a module was
   * assigned, keep the existing dashboard shell reachable automatically. */
  if (selected.some(item => VISITOR_PAGE_IDS.has(item) && ![
    'dashboard', 'profile', 'access', 'calendar', 'notification',
    'leavesCourses', 'quickLinks', 'settings'
  ].includes(item))) {
    if (!selected.includes('dashboard')) selected.unshift('dashboard');
  }
  return selected;
}

export function normalizeVisitorPageAccess(value) {
  return normalizeVisitorAccessList(value);
}

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

  const canonicalId = normalizeUserId(
    user.user_id ||
    user.userId ||
    user.id ||
    user.username ||
    targetUserId
  );

  let visitorPageAccess = null;
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

    if (role === 'VISITOR') {
      visitorPageAccess = visitorPageAccessForUser(settings, canonicalId);
    }
  }

  return {
    token,
    session: {
      userId: session.user_id,
      name: session.name,
      role: session.role,
      issuedAt: session.issued_at,
      expiresAt: session.expires_at
    },
    pageAccess: visitorPageAccess,
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