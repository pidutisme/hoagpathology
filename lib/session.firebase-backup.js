import { createHash } from 'node:crypto';
import { normalizeUserId } from './auth.js';

const SESSIONS = 'labapp/auth/sessions';
const USERS = 'labapp/auth/users';
const SETTINGS = 'labapp/settings';
const tokenHash = token => createHash('sha256').update(`token\n${String(token || '')}`, 'utf8').digest('hex');
const asList = value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
const dbCache = new WeakMap();
const CACHE_TTL_MS = 3000;

async function readCached(db, path) {
  let map = dbCache.get(db);
  if (!map) {
    map = new Map();
    dbCache.set(db, map);
  }
  const hit = map.get(path);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.val;
  const val = (await db.ref(path).get()).val();
  map.set(path, { at: Date.now(), val });
  return val;
}

function extractUsers(stored) {
  if (Array.isArray(stored?.users)) return stored.users;
  const source = stored?.users && typeof stored.users === 'object' ? stored.users : stored;
  if (!source || typeof source !== 'object') return [];
  return Object.entries(source)
    .filter(([key]) => !['version', 'updatedAt'].includes(key))
    .map(([key, item]) => (item && typeof item === 'object' ? (item.userId || item.id || item.username ? item : { ...item, userId: key }) : null))
    .filter(Boolean);
}

function matchesUser(u, targetId) {
  if (!u || typeof u !== 'object' || u.deleted === true) return false;
  return [u.userId, u.id, u.username, u.displayName, u.name].some(v => v && normalizeUserId(v) === targetId);
}

export async function sessionFor(db, token) {
  token = String(token || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 300);
  if (!token) return null;
  const session = (await db.ref(`${SESSIONS}/${tokenHash(token)}`).get()).val();
  const expiresAt = Date.parse(session?.expiresAt);
  const issuedAt = Date.parse(session?.issuedAt);
  if (!session || !session.userId || !Number.isFinite(expiresAt) || expiresAt <= Date.now() || !Number.isFinite(issuedAt)) return null;
  const targetUserId = normalizeUserId(session.userId);
  let user = null;
  const directUser = (await db.ref(`${USERS}/users/${targetUserId}`).get()).val() || (await db.ref(`${USERS}/${targetUserId}`).get()).val();
  if (directUser && typeof directUser === 'object' && !Array.isArray(directUser) && matchesUser({ userId: targetUserId, ...directUser }, targetUserId)) {
    user = { userId: targetUserId, ...directUser };
  } else {
    const stored = await readCached(db, USERS);
    const users = extractUsers(stored);
    user = users.find(u => matchesUser(u, targetUserId)) || null;
  }
  if (!user || user.active === false || (Date.parse(user.sessionsRevokedAt || '') > 0 && Date.parse(user.sessionsRevokedAt) >= issuedAt)) return null;
  const role = normalizeUserId(user.role || session.role || 'USER');
  if (role !== 'ADMIN') {
    let maintenance = await readCached(db, `${SETTINGS}/maintenance`);
    if (maintenance === null || maintenance === undefined) {
      const settings = (await readCached(db, SETTINGS)) || {};
      maintenance = settings.maintenance;
    }
    if (maintenance?.enabled) return null;
  }
  const canonicalId = normalizeUserId(user.userId || user.id || user.username || targetUserId);
  return { token, session, user, userId: canonicalId, role };
}

export async function appendSystemLog(db, entry) {
  const root = db.ref('labapp/systemLogs');
  const at = String(entry?.at || new Date().toISOString());
  const logRef = root.child('logs').push();
  await logRef.set({ ...entry, at });
  await root.update({ version: 2, updatedAt: at });
  return logRef.key;
}
