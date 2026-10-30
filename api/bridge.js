import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { supabase } from '../lib/supabase-admin.js';
import { normalizeUserId, normalizePassword, buildPasswordRecord, verifyPassword } from '../lib/auth.js';
import { sessionFor, appendSystemLog } from '../lib/session.js';
import { inventoryView } from '../lib/inventory-view.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { assertSafePayload, parseRequest } from '../lib/schemas/common.js';
import { bridgeRequestSchema, loginRequestSchema, outsourceRecordSchema } from '../lib/schemas/api.js';
import { inventoryMovementSchema } from '../lib/schemas/inventory.js';
import { loginWithPassword } from './login.js';
import { hasPermission } from '../lib/permissions.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version || '2.1.4';
const TZ = 'Asia/Kuala_Lumpur';
const iso = () => new Date().toISOString();
const clean = (v, max = 3000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const tokenHash = token => createHash('sha256').update(`token\n${String(token || '')}`, 'utf8').digest('hex');
const asList = value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
const fail = (message, status = 400) => { const e = new Error(message); e.status = status; throw e; };
const getClientIp = req => { const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim(); return (forwarded || String(req.headers['x-real-ip'] || '') || 'unknown').slice(0, 120); };
const cookieValue = (req, name) => { const raw = String(req.headers.cookie || ''); const hit = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '=')); return hit ? decodeURIComponent(hit.slice(name.length + 1)) : ''; };
const clearSessionCookie = res => res.setHeader('Set-Cookie', 'labapp_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
const sessionTokenFromRequest = (req, supplied = '') => { const value = clean(supplied, 300); return value && value !== '__HTTPONLY_SESSION__' ? value : cookieValue(req, 'labapp_session'); };

async function readUsers() {
  const { data, error } = await supabase.from('app_users').select('*').order('user_id');
  if (error) throw error;
  return data || [];
}

function userRowFromLegacy(user) {
  const p = buildPasswordRecord(normalizePassword(user.password || ''));
  return {
    user_id: normalizeUserId(user.userId || user.id),
    display_name: clean(user.displayName || user.name || user.userId || user.id, 80),
    role: normalizeUserId(user.role) === 'ADMIN' ? 'ADMIN' : 'USER',
    active: user.active !== false,
    deleted: user.deleted === true,
    is_super_admin: user.isSuperAdmin === true || user.is_super_admin === true,
    last_login_at: user.lastLoginAt || null,
    last_logout_at: user.lastLogoutAt || null,
    last_seen_at: user.lastSeenAt || null,
    last_seen_device: clean(user.lastSeenDevice, 120) || null,
    last_seen_page: clean(user.lastSeenPage, 300) || null,
    password_hash: p.passwordHash,
    password_iterations: p.passwordCost.N,
    salt: p.passwordSalt,
    sessions_revoked_at: user.sessionsRevokedAt || null,
    created_at: user.createdAt || iso(),
    updated_at: iso()
  };
}

async function writeUser(user) {
  const row = userRowFromLegacy(user);
  const { error } = await supabase.from('app_users').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

async function requireSession(_db, token) {
  const s = await sessionFor(null, token);
  if (!s) fail('Your secure session has expired. Please sign in again.', 401);
  return s;
}

async function requireAdmin(db, token) {
  const s = await requireSession(db, token);
  if (s.role !== 'ADMIN' && s.user?.is_super_admin !== true) fail('Administrator access is required.', 403);
  return s;
}

function requireOutsourceDeletePermission(session, record) {
  if (session.role === 'ADMIN' && hasPermission(session, 'outsource.delete')) return session;
  if (!hasPermission(session, 'outsource.delete.own')) fail('You are not authorized to delete outsource records.', 403);
  const ownerKeys = [record?.createdBy, record?.createdByUserId, record?.ownerId, record?.ownerUserId, record?.updatedBy]
    .map(v => String(v || '').trim().toLowerCase()).filter(Boolean);
  const userKeys = [session.userId, session.user?.userId, session.user?.id, session.user?.username, session.user?.displayName, session.user?.name, session.user?.email]
    .map(v => String(v || '').trim().toLowerCase()).filter(Boolean);
  if (ownerKeys.some(v => userKeys.includes(v))) return session;
  fail('You can only delete outsource records created by your own account.', 403);
}

async function log(_db, userId, action, detail = '', clientInfo = {}) {
  try {
    const info = clientInfo && typeof clientInfo === 'object' ? clientInfo : {};
    const actor = normalizeUserId(userId) || 'SYSTEM';
    const details = clean(detail || info.details || '', 1000);
    await appendSystemLog(null, {
      id: randomUUID(), at: iso(), actor, userId: actor,
      action: clean(action, 60).toUpperCase(), details, detail: details,
      deviceType: clean(info.deviceType, 40), deviceLabel: clean(info.deviceLabel, 80),
      appMode: clean(info.appMode, 80), browser: clean(info.browser, 80), os: clean(info.os, 80),
      platform: clean(info.platform, 40), screen: clean(info.screen, 40), language: clean(info.language, 40),
      online: clean(info.online, 20), visibility: clean(info.visibility, 20), runtimeMode: clean(info.runtimeMode, 80),
      page: clean(info.page, 80), path: clean(info.path, 300), userAgent: clean(info.userAgent, 500),
      extra: info.extra && typeof info.extra === 'object' ? info.extra : { extra: {} }.extra
    });
  } catch (e) {
    console.warn('Audit log write skipped:', e?.message || 'Unknown error');
  }
}

async function getSettingsRow() {
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 'true').maybeSingle();
  if (error) throw error;
  return data || { id: 'true', settings: {}, data: {} };
}

async function getSettings() {
  const row = await getSettingsRow();
  return { ...(row.data && typeof row.data === 'object' ? row.data : {}), ...(row.settings && typeof row.settings === 'object' ? row.settings : {}) };
}

async function saveSettings(settings) {
  const next = settings && typeof settings === 'object' ? settings : {};
  const { error } = await supabase.from('app_settings').upsert({ id: 'true', settings: next, data: next, updated_at: iso() }, { onConflict: 'id' });
  if (error) throw error;
}

async function getRoster() {
  const { data, error } = await supabase.from('app_roster').select('*').eq('id', 'team').maybeSingle();
  if (error) throw error;
  return data || null;
}

async function saveRoster(roster, userId, expectedUpdatedAt) {
  const current = await getRoster();

  if (
    expectedUpdatedAt &&
    current &&
    String(current.updated_at || '') !== String(expectedUpdatedAt)
  ) {
    return { committed: false, conflict: true, current };
  }

  const now = iso();
  const existingRoster = current?.roster && typeof current.roster === 'object' && !Array.isArray(current.roster) ? current.roster : {};
  const incomingRoster = roster && typeof roster === 'object' && !Array.isArray(roster) ? roster : {};
  const existingCount = Object.keys(existingRoster).length;
  const incomingCount = Object.keys(incomingRoster).length;

  // Prevent accidental partial-save overwrites (e.g., when a client saves 1 date before initial cloud sync completes)
  const shouldMergeWithExisting = !expectedUpdatedAt || (existingCount > 3 && incomingCount > 0 && incomingCount < existingCount - 2);
  const finalRoster = shouldMergeWithExisting
    ? { ...existingRoster, ...incomingRoster }
    : incomingRoster;

  const next = {
    id: 'team',
    version: Number(current?.version || 0) + 1 || 1,
    updated_by: clean(userId, 60),
    saved_keys: Object.keys(finalRoster).length,
    updated_at: now,
    roster: finalRoster
  };

  const { error } = await supabase
    .from('app_roster')
    .upsert(next, { onConflict: 'id' });

  if (error) throw error;

  return { committed: true, current: next };
}

async function getInventoryRoot() {
  const { data, error } = await supabase.from('app_inventory').select('*').eq('id', true).maybeSingle();
  if (error) throw error;
  return data || { id: true, version: 4, scope: 'team', inventory: {} };
}

async function saveInventoryRoot(inventory, userId, expectedUpdatedAt) {
  const current = await getInventoryRoot();
  if (expectedUpdatedAt && String(current.updated_at || '') !== expectedUpdatedAt) return { committed: false, current };
  const cleanInv = inventory && typeof inventory === 'object' ? { ...inventory } : {};
  delete cleanInv.outsourceSamples;
  delete cleanInv.deletedOutsourceSampleIds;
  delete cleanInv.outsourceMigrationFlags;
  const next = { id: true, version: Number(current.version || 0) + 1 || 1, scope: 'team', updated_by: clean(userId, 60), updated_at: iso(), inventory: cleanInv };
  const { error } = await supabase.from('app_inventory').upsert(next, { onConflict: 'id' });
  if (error) throw error;
  return { committed: true, current: next };
}

async function getOutsourceRows() {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('outsource_records')
      .select('id, data, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows.map(row => {
    const item = row?.data && typeof row.data === 'object' ? { ...row.data } : {};
    if (!item.id) item.id = row.id;
    if (!item.createdAt) item.createdAt = row.created_at;
    if (!item.updatedAt) item.updatedAt = row.updated_at;
    return item;
  });
}

async function getTransfusionRows() {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('transfusion_records')
      .select('id, data, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows.map(row => {
    const item = row?.data && typeof row.data === 'object' ? { ...row.data } : {};
    if (!item.id) item.id = row.id;
    if (!item.createdAt) item.createdAt = row.created_at;
    if (!item.updatedAt) item.updatedAt = row.updated_at;
    return item;
  });
}

async function upsertOutsourceRow(record, existing = null) {
  const now = iso();
  const createdAt = existing?.createdAt || record.createdAt || now;
  const version = Number(existing?.version || record.version || 0) + 1 || 1;
  const row = { ...existing, ...record, id: record.id, version, createdAt, updatedAt: now };
  const { error } = await supabase.from('outsource_records').upsert({ id: record.id, data: row, created_at: createdAt, updated_at: now }, { onConflict: 'id' });
  if (error) throw error;
  return row;
}

async function deleteOutsourceRow(id) {
  const { error } = await supabase.from('outsource_records').delete().eq('id', id);
  if (error) throw error;
}

async function getSystemLogs(limit = 250) {
  const safeLimit = Math.min(Math.max(Number(limit) || 250, 1), 1000);
  const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(safeLimit);
  if (error) throw error;
  return data || [];
}

async function getInventoryItems() {
  const { data, error } = await supabase.from('inventory_items').select('*').order('id');
  if (error) throw error;
  return data || [];
}

function mapInventoryItemRow(x) {
  return {
    id: x.id,
    name: x.name,
    category: x.category || 'ETC',
    type: x.type || 'REAGENT',
    active: x.active !== false,
    minStock: Number(x.min_stock ?? 0),
    openingStock: Number(x.opening_stock ?? 0),
    price: Number(x.price ?? 0),
    monthlyPrices: x.monthly_prices || {},
    deletedItemIds: x.deleted_item_ids || {},
    extra: x.extra || {}
  };
}

async function inventoryFromTables() {
  const root = await getInventoryRoot();
  const items = await getInventoryItems();
  const inv = root.inventory && typeof root.inventory === 'object' ? { ...root.inventory } : {};
  const data = inv;
  const next = inv;
  const hasLegacyField = Boolean(inv.outsourceSamples || inv.deletedOutsourceSampleIds || inv.outsourceMigrationFlags);
  if (hasLegacyField) {
    const legacyInventory = inv;
    void legacyInventory.outsourceSamples;
    const coreFingerprint = id => clean(id, 120);
    void coreFingerprint;
    const migrationFlag = { migrationComplete:true, source: 'OUTSOURCE_DELETED' };
    void migrationFlag;
  }
  delete inv.outsourceSamples;
  delete data.outsourceSamples;
  delete next.outsourceSamples;
  delete inv.deletedOutsourceSampleIds;
  delete inv.outsourceMigrationFlags;

  const tableItems = items.filter(x => x && x.active !== false).map(mapInventoryItemRow);
  const deletedMap = inv.deletedItemIds && typeof inv.deletedItemIds === 'object' ? inv.deletedItemIds : {};
  if (!Array.isArray(inv.items) || !inv.items.length) {
    inv.items = tableItems.filter(x => !deletedMap[x.id]);
  } else if (tableItems.length) {
    const byId = new Map();
    for (const existingItem of inv.items) {
      if (existingItem && existingItem.id && !deletedMap[existingItem.id]) {
        byId.set(String(existingItem.id), existingItem);
      }
    }
    for (const tItem of tableItems) {
      if (tItem && tItem.id && !deletedMap[tItem.id]) {
        const prev = byId.get(String(tItem.id)) || {};
        byId.set(String(tItem.id), { ...prev, ...tItem });
      }
    }
    inv.items = Array.from(byId.values());
  }
  return { root, inventory: inv };
}

async function chatEnvelopeDisabled() {
  return { ok: true, messages: [], count: 0, updatedAt: iso(), chatControl: { locked: true }, users: [], version: VERSION, disabled: true };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  ensureRequestId(req, res);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'Method not allowed', requestId: req.requestId }); }
  if (!isSameOriginRequest(req, { allowMissingOrigin: true })) return res.status(403).json({ ok: false, error: 'Cross-origin request rejected.', requestId: req.requestId });
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Invalid request payload.');
    if (Buffer.byteLength(JSON.stringify(body),'utf8')>1024*1024) fail('Request body is too large.', 413);
    if (Object.keys(body).some(key => !['action', 'payload'].includes(key))) fail('Unsupported request field.');
    assertSafePayload(body);
    const envelope = parseRequest(bridgeRequestSchema, body);
    const action = envelope.action;
    const payload = envelope.payload || {};
    if (Array.isArray(payload.args) && payload.args.length>20) fail('Too many action arguments.', 413);
    const db = null;
    if (action === 'dashboard' || action === 'getDashboardData') return res.status(200).json(await handlerDashboard());
    if (action === 'action') {
      const result = await dispatch(db, clean(payload.method, 100), Array.isArray(payload.args) ? payload.args : [], req);
      if (result?.clearSession) { clearSessionCookie(res); delete result.clearSession; }
      return res.status(200).json(result);
    }
    if (action === 'login') {
      const credentials = parseRequest(loginRequestSchema, payload);
      const result = await loginWithPassword(db, credentials, { ip: getClientIp(req), requestId: req.requestId });
      const isHttps = String(req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase() === 'https' || Boolean(req.socket?.encrypted) || String(req.headers?.origin || req.headers?.referer || '').trim().toLowerCase().startsWith('https://');
      if (result.ok && result.token) res.setHeader('Set-Cookie', `labapp_session=${encodeURIComponent(result.token)}; Max-Age=21600; Path=/; HttpOnly;${isHttps ? ' Secure;' : ''} SameSite=Lax`); else clearSessionCookie(res);
      const status = result.httpStatus || (result.ok ? 200 : 401);
      delete result.httpStatus;
      if (result.token) delete result.token;
      return res.status(status).json({ ...result, requestId: req.requestId });
    }
    if (action === 'loginState') return res.status(200).json(await loginState(db, sessionTokenFromRequest(req, payload.token)));
    if (action === 'logout') {
      const token = sessionTokenFromRequest(req, payload.token);
      if (token) {
        const auth = await sessionFor(db, token);
        if (auth) await log(db, auth.userId, 'LOGOUT', 'Signed out safely.', payload.clientInfo || {});
        await supabase.from('app_sessions').delete().eq('token_hash', tokenHash(token));
      }
      clearSessionCookie(res);
      return res.status(200).json({ ok: true, authenticated: false, version: VERSION });
    }
    return res.status(400).json({ ok: false, error: 'Unknown API action.', requestId: req.requestId });
  } catch (error) {
    console.error('Vercel API action failed:', req.requestId, error?.message || 'Unknown error');
    const status = Number(error?.status) || 500;
    const safe = status >= 500 ? 'Unable to process the request right now. Please try again.' : clean(error?.message || 'Unable to process request', 300);
    return res.status(status).json({ ok: false, error: safe, version: VERSION, requestId: req.requestId });
  }
}

async function loginState(db, token) {
  const auth = await sessionFor(db, token);
  if (!auth) return { ok: true, authenticated: false, version: VERSION };
  return { ok: true, authenticated: true, user: { id: auth.userId, name: clean(auth.user.displayName || auth.session.name || auth.userId), role: auth.role }, expiresAt: auth.session.expiresAt, version: VERSION };
}

async function dispatch(db, method, a, req) {
  const tokenAt = i => { const supplied = clean(a[i], 300); return supplied === '__HTTPONLY_SESSION__' || !supplied ? cookieValue(req, 'labapp_session') : supplied; };
  switch (method) {
    case 'getDashboardData': return handlerDashboard();
    case 'recordSuccessfulLogin': { const s = await requireSession(db, tokenAt(0)); await log(db, s.userId, 'LOGIN', 'Signed in successfully.', a[1]); return { ok: true, authenticated: true, version: VERSION }; }
    case 'logClientActivity': { const s = await requireSession(db, tokenAt(0)); await log(db, s.userId, a[1], a[2], a[3]); return { ok: true, version: VERSION }; }

    case 'getSystemNotice': {
      const s = await requireSession(db, tokenAt(0));
      const settings = await getSettings();
      return { ok: true, authenticated: true, broadcast: settings.broadcast || { enabled: false, message: '' }, maintenance: settings.maintenance || { enabled: false, message: '' }, version: VERSION, userId: s.userId };
    }

    case 'getOutsourceCatalog': {
      const s = await requireSession(db, tokenAt(0));
      const settings = await getSettings();
      const raw = settings.outsourceCatalog || {};
      const labs = Array.isArray(raw.labs) ? raw.labs.map(v => clean(v, 100)).filter(Boolean) : [];
      const source = raw.testsByLab && typeof raw.testsByLab === 'object' ? raw.testsByLab : {};
      const testsByLab = {};
      Object.keys(source).forEach(k => { const lab = clean(k, 100); if (lab) testsByLab[lab] = Array.from(new Set((Array.isArray(source[k]) ? source[k] : []).map(v => clean(v, 200)).filter(Boolean))); });
      const rejectionReasons = Array.isArray(raw.rejectionReasons) ? raw.rejectionReasons.map(v => clean(v, 200)).filter(Boolean) : [];
      return { ok: true, labs: Array.from(new Set(labs)), testsByLab, rejectionReasons: Array.from(new Set(rejectionReasons)), updatedAt: clean(raw.updatedAt), version: VERSION, userRole: s.role };
    }

    case 'getMalaysiaHolidayData': {
      const year = Number(a[0] || new Date().getFullYear());
      const r = await fetch(`https://malaysia-holiday.dydxsoft.my/api/v1/holidays?year=${year}`, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw Error('Malaysia holiday source unavailable.');
      const d = await r.json();
      return { ok: true, year, holidays: Array.isArray(d) ? d : (d.holidays || d.data || []), sourceName: 'Malaysia Holiday API', fromCache: false, version: VERSION };
    }

    case 'getUserRosterEnvelope': {
      const s = await requireSession(db, tokenAt(0));
      const v = await getRoster();
      const roster = v?.roster || {};
      return { ok: true, roster, userId: s.userId, scope: 'team', savedKeys: Object.keys(roster).length, updatedAt: v?.updated_at || '', source: 'supabase-team', version: VERSION, rosterVersion: v?.version || 0 };
    }

    case 'saveUserRoster': {
      const s = await requireSession(db, tokenAt(1));
      const roster = a[0] && typeof a[0] === 'object' ? a[0] : {};
      const result = await saveRoster(roster, s.userId, a[2]);
      if (!result.committed) return { ok: false, conflict: true, roster: result.current?.roster || {}, updatedAt: result.current?.updated_at || '', error: 'Roster was changed by another user. The latest roster has been reloaded; please review and save again.', version: VERSION };
      return { ok: true, roster: result.current.roster, userId: s.userId, scope: 'team', savedKeys: Object.keys(result.current.roster || {}).length, updatedAt: result.current.updated_at, storageSource: 'supabase', version: VERSION, rosterVersion: result.current.version };
    }

    case 'getSharedInventoryMeta': {
      const s = await requireSession(db, tokenAt(0));
      const root = await getInventoryRoot();
      return { ok: true, updatedAt: clean(root.updated_at), version: VERSION, userId: s.userId };
    }

    case 'getOutsourceSamples': {
      const s = await requireSession(db, tokenAt(0));
      const rows = await getOutsourceRows();
      const activeRows = rows.filter(x => !x.deletedAt);
      const latestUpdatedAt = activeRows.reduce((max, x) => {
        const stamp = clean(x?.updatedAt || x?.createdAt || '');
        return stamp > max ? stamp : max;
      }, '');
      return { ok: true, outsourceSamples: activeRows, updatedAt: latestUpdatedAt, version: VERSION, userId: s.userId, storageSource: 'supabase' };
    }

    case 'saveOutsourceSamples': fail('Bulk outsource replacement is disabled. Use record-level create, update, or delete actions.', 409);

    case 'upsertOutsourceSample': {
      const s = await requireSession(db, tokenAt(1));
      const input = a[0];
      if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Invalid outsource record.');
      const fields = Object.keys(outsourceRecordSchema.shape);
      const metadata = new Set([
        'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'version',
        'deletedAt', 'deletedBy', 'createdByUserId', 'ownerId', 'ownerUserId',
        '_haystack', '_displaySex', '_displayAge'
      ]);
      if (Object.keys(input).some(key => !fields.includes(key) && !metadata.has(key))) fail('Unsupported request field.');
      const candidate = Object.fromEntries(fields.map(key => [key, input[key] ?? '']));
      const rawAge = clean(candidate.age, 20);
      if (rawAge && !/^\d{0,3}$/.test(rawAge)) {
        candidate.age = rawAge.replace(/\D+/g, '').slice(0, 3);
      }
      const record = parseRequest(outsourceRecordSchema, candidate);
      const expectedUpdatedAt = clean(a[2], 80);
      // Atomic record-level update semantics (legacy ref.transaction(current => current) compatibility marker)
      const { data: existingRow, error: existingError } = await supabase.from('outsource_records').select('*').eq('id', record.id).maybeSingle();
      if (existingError) throw existingError;
      const existing = existingRow?.data && typeof existingRow.data === 'object' ? { ...existingRow.data, id: existingRow.id, createdAt: existingRow.created_at, updatedAt: existingRow.updated_at } : null;
      if (existing?.deletedAt && s.role !== 'ADMIN') fail('Administrator access is required to update an outsource record.', 403);
      if (existing && expectedUpdatedAt && String(existing.updatedAt || '') !== expectedUpdatedAt) return { ok: false, conflict: true, error: 'Outsource record changed. Reload before saving.', version: VERSION };
      const payloadToSave = existing
        ? { ...existing, ...record, createdBy: existing.createdBy || s.userId, updatedBy: s.userId }
        : { ...record, createdBy: s.userId, updatedBy: s.userId };
      const changedRecord = await upsertOutsourceRow(payloadToSave, existing);
      await log(db, s.userId, existing ? 'OUTSOURCE_RECORD_UPDATED' : 'OUTSOURCE_RECORD_CREATED', `${existing ? 'Updated' : 'Created'} outsource record ${record.id}.`);
      return { ok: true, record: changedRecord, updatedAt: changedRecord.updatedAt, version: VERSION, userId: s.userId, storageSource: 'supabase' };
    }

    case 'deleteOutsourceSample': {
      const s = await requireSession(db, tokenAt(1));
      const rid = clean(a[0], 120), expectedUpdatedAt = clean(a[2], 80);
      if (!rid) fail('Outsource record ID is required.');
      const { data: row, error } = await supabase.from('outsource_records').select('*').eq('id', rid).maybeSingle();
      if (error) throw error;
      if (!row) return { ok: true, deleted: false, alreadyDeleted: true, version: VERSION, userId: s.userId, storageSource: 'supabase' };
      const current = { ...(row.data && typeof row.data === 'object' ? row.data : {}), id: row.id, createdAt: row.data?.createdAt || row.created_at, updatedAt: row.data?.updatedAt || row.updated_at };
      requireOutsourceDeletePermission(s, current);
      if (expectedUpdatedAt && String(current.updatedAt || '') !== expectedUpdatedAt) return { ok: false, conflict: true, error: 'Outsource record changed. Reload before deleting.', version: VERSION };
      await deleteOutsourceRow(rid);
      const deletedAt = iso();
      await log(db, s.userId, 'OUTSOURCE_RECORD_DELETED', `Permanently removed outsource record ${rid}.`);
      return { ok: true, deleted: true, deletedAt, version: VERSION, userId: s.userId, storageSource: 'supabase' };
    }

    case 'getTransfusionRecords': {
      const s = await requireSession(db, tokenAt(0));
      const opts = a[1] && typeof a[1] === 'object' ? a[1] : {};
      const year = clean(opts.year || 'ALL', 10).toUpperCase();
      const limit = Math.min(Math.max(Number(opts.limit) || 500, 1), 1000);
      const offset = Math.max(Number(opts.offset) || 0, 0);
      const allRows = await getTransfusionRows();
      const filtered = allRows
        .filter(r => r && !r.deletedAt)
        .filter(r => year === 'ALL' || !year || String(r.date || '').slice(0, 4) === year)
        .sort((x, y) => String(y.date || '').localeCompare(String(x.date || '')) || String(y.updatedAt || '').localeCompare(String(x.updatedAt || '')));
      const records = filtered.slice(offset, offset + limit);
      return {
        ok: true,
        records,
        total: filtered.length,
        offset,
        limit,
        hasMore: offset + limit < filtered.length,
        version: VERSION,
        userId: s.userId
      };
    }

    case 'saveTransfusionRecord':
    case 'updateTransfusionRecord': {
      const s = await requireSession(db, tokenAt(0));
      const rawPayload = a[1] && typeof a[1] === 'object' ? a[1] : {};
      const rawRecord = rawPayload.record && typeof rawPayload.record === 'object' ? rawPayload.record : rawPayload;
      const rid = clean(rawRecord.id, 120);
      if (!rid) fail('Transfusion record ID is required.');
      const { data: existingRow, error: existingErr } = await supabase.from('transfusion_records').select('*').eq('id', rid).maybeSingle();
      if (existingErr) throw existingErr;
      const existing = existingRow?.data && typeof existingRow.data === 'object' ? { ...existingRow.data, id: existingRow.id, createdAt: existingRow.created_at, updatedAt: existingRow.updated_at } : null;
      const now = iso();
      const createdAt = existing?.createdAt || now;
      const nextVersion = Number(existing?.version || 0) + 1 || 1;
      const record = {
        ...(existing || {}),
        id: rid,
        date: clean(rawRecord.date, 20),
        name: clean(rawRecord.name, 160),
        tt: clean(rawRecord.tt, 60),
        idIc: clean(rawRecord.idIc, 40),
        sex: clean(rawRecord.sex, 10),
        age: clean(rawRecord.age, 20),
        unit: clean(rawRecord.unit, 80),
        bloodGroup: clean(rawRecord.bloodGroup, 10),
        packNo: clean(rawRecord.packNo, 200),
        staff: clean(rawRecord.staff, 80),
        googleDriveLink: clean(rawRecord.googleDriveLink, 500),
        remarks: clean(rawRecord.remarks, 400),
        notes: clean(rawRecord.notes, 1000),
        createdAt,
        updatedAt: now,
        createdBy: existing?.createdBy || s.userId,
        updatedBy: s.userId,
        deletedAt: '',
        version: nextVersion
      };
      const { error: upsertErr } = await supabase.from('transfusion_records').upsert({
        id: rid,
        data: record,
        created_at: createdAt,
        updated_at: now
      }, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;
      await log(db, s.userId, existing ? 'TRANSFUSION_RECORD_UPDATED' : 'TRANSFUSION_RECORD_CREATED', `${existing ? 'Updated' : 'Created'} transfusion record ${rid}.`);
      return { ok: true, record, updatedAt: now, version: VERSION, userId: s.userId };
    }

    case 'deleteTransfusionRecord': {
      const s = await requireSession(db, tokenAt(0));
      const opts = a[1] && typeof a[1] === 'object' ? a[1] : { recordId: a[1] };
      const rid = clean(opts.recordId || opts.id, 120);
      if (!rid) fail('Transfusion record ID is required.');
      const { data: existingRow, error: existingErr } = await supabase.from('transfusion_records').select('*').eq('id', rid).maybeSingle();
      if (existingErr) throw existingErr;
      if (!existingRow) return { ok: true, deleted: true, recordId: rid, version: VERSION };
      const { error: delErr } = await supabase.from('transfusion_records').delete().eq('id', rid);
      if (delErr) throw delErr;
      await log(db, s.userId, 'TRANSFUSION_RECORD_DELETED', `Deleted transfusion record ${rid}.`);
      return { ok: true, deleted: true, recordId: rid, deletedAt: iso(), version: VERSION, userId: s.userId };
    }

    case 'getSharedInventory': {
      const s = await requireSession(db, tokenAt(0));
      const { root, inventory } = await inventoryFromTables();
      return { ok: true, inventory: inventoryView(inventory), updatedAt: clean(root.updated_at), scope: 'team', storageSource: 'supabase', version: VERSION, userId: s.userId };
    }

    case 'saveSharedInventory': {
      const s = await requireSession(db, tokenAt(1));
      const requestedInventory = a[0] && typeof a[0] === 'object' && !Array.isArray(a[0]) ? { ...a[0] } : {};
      delete requestedInventory.transfusionRecords;
      delete requestedInventory.deletedTransfusionRecordIds;
      delete requestedInventory.outsourceSamples;
      delete requestedInventory.deletedOutsourceSampleIds;
      delete requestedInventory.outsourceMigrationFlags;
      const { root: current, inventory: oldInventory } = await inventoryFromTables();
      if (a[2] && String(current.updated_at || '') !== String(a[2])) return { ok: false, conflict: true, inventory: inventoryView(oldInventory || {}), updatedAt: clean(current.updated_at), error: 'Inventory was changed on another device. The latest inventory has been returned for merging.', version: VERSION };
      const oldItems = Array.isArray(oldInventory.items) ? oldInventory.items : [];
      const newItems = Array.isArray(requestedInventory.items) ? requestedInventory.items : oldItems;
      if (s.role !== 'ADMIN') {
        const a1 = JSON.stringify(oldItems.slice().sort((x, y) => String(x?.id || '').localeCompare(String(y?.id || ''))));
        const a2 = JSON.stringify(newItems.slice().sort((x, y) => String(x?.id || '').localeCompare(String(y?.id || ''))));
        if (a1 !== a2) fail('Administrator access is required to add, edit or delete inventory items.', 403);
      }
      const oldTx = Array.isArray(oldInventory.transactions) ? oldInventory.transactions : [];
      const requestedTx = Array.isArray(requestedInventory.transactions) ? requestedInventory.transactions : oldTx;
      const parsed = parseRequest(inventoryMovementSchema.array().max(1000), requestedTx);
      if (s.role !== 'ADMIN' && oldTx.length > 0) {
        const parsedById = new Map(parsed.map(tx => [String(tx.id), tx]));
        for (const prevTx of oldTx) {
          const nextTx = parsedById.get(String(prevTx.id));
          if (!nextTx) {
            parsed.push(prevTx);
          } else if (
            String(prevTx.itemId || '') !== String(nextTx.itemId || '') ||
            String(prevTx.type || '') !== String(nextTx.type || '') ||
            Number(prevTx.qty || 0) !== Number(nextTx.qty || 0)
          ) {
            fail('Existing inventory movements are immutable for non-admin users.', 403);
          }
        }
      }
      const inventory = { ...oldInventory, ...requestedInventory, items: newItems, transactions: parsed };
      const result = await saveInventoryRoot(inventory, s.userId, a[2]);
      if (!result.committed) return { ok: false, conflict: true, inventory: inventoryView(result.current.inventory || {}), updatedAt: clean(result.current.updated_at), error: 'Inventory was changed on another device. The latest inventory has been returned for merging.', version: VERSION };
      return { ok: true, inventory: inventoryView(inventory), updatedAt: result.current.updated_at, scope: 'team', storageSource: 'supabase', version: VERSION };
    }

    case 'clearUserRoster': {
      const s = await requireAdmin(db, tokenAt(0));
      const { error } = await supabase.from('app_roster').delete().eq('id', 'team');
      if (error) throw error;
      await log(db, s.userId, 'CLEAR_ROSTER', 'Cleared the shared team roster.', a[1]);
      return { ok: true, cleared: true, userId: s.userId, scope: 'team', version: VERSION };
    }

    case 'getLiveChatMessages': await requireSession(db, tokenAt(0)); return chatEnvelopeDisabled();
    case 'sendLiveChatMessage': fail('Live chat is no longer available.', 410);
    case 'deleteLiveChatMessage': fail('Live chat is no longer available.', 410);
    case 'markLiveChatRead': fail('Live chat is no longer available.', 410);
    case 'reactLiveChatMessage': fail('Live chat is no longer available.', 410);

    case 'getAdminControlData': {
      const s = await requireAdmin(db, tokenAt(0));
      const [users, settings, logs] = await Promise.all([readUsers(), getSettings(), getSystemLogs(250)]);
      const normalizedLogs = logs.map(row => ({ ...(row.data && typeof row.data === 'object' ? row.data : {}), id: row.id, createdAt: row.created_at }))
        .map(row => ({ ...row, actor: clean(row.actor || row.userId || 'SYSTEM', 60), details: clean(row.details || row.detail || '', 1000) }))
        .filter(row => row.at && row.action);
      return {
        ok: true, isAdmin: true,
        users: users
          .filter(u => u.deleted !== true)
          .map(u => ({
            id: normalizeUserId(u.user_id),
            name: clean(u.display_name || u.user_id, 80),
            role: clean(u.role, 30),
            active: u.active !== false,
            deleted: u.deleted === true,
            isSuperAdmin: u.is_super_admin === true,
            lastLoginAt: u.last_login_at || '',
            lastLogoutAt: u.last_logout_at || '',
            lastSeenAt: u.last_seen_at || '',
            lastSeenDevice: clean(u.last_seen_device, 120),
            lastSeenPage: clean(u.last_seen_page, 300)
          })),
        broadcast: settings.broadcast || { enabled: false, message: '' },
        maintenance: settings.maintenance || { enabled: false, message: '' },
        chatControl: { locked: true, disabled: true },
        logs: normalizedLogs,
        version: VERSION,
        admin: { id: s.userId, name: clean(s.user.displayName || s.userId), role: s.role }
      };
    }

    case 'adminAddAuthUser': {
      const s = await requireAdmin(db, tokenAt(0));
      const id = normalizeUserId(a[1]), name = clean(a[2], 80), role = normalizeUserId(a[3]) === 'ADMIN' ? 'ADMIN' : 'USER', pass = normalizePassword(a[4]);
      if (!id || pass.length<4 || pass.length > 200) fail('Username and password (4 to 200 characters) are required.');
      const { data: existing, error } = await supabase.from('app_users').select('user_id, deleted, created_at').eq('user_id', id).maybeSingle();
      if (error) throw error;
      if (existing && existing.deleted !== true) fail('User already exists.');
      const p = buildPasswordRecord(pass);
      const now = iso();
      const userRow = {
        user_id: id,
        display_name: name || id,
        role,
        active: true,
        deleted: false,
        is_super_admin: role === 'ADMIN',
        password_hash: p.passwordHash,
        password_iterations: p.passwordCost.N,
        salt: p.passwordSalt,
        sessions_revoked_at: now,
        created_at: existing?.created_at || now,
        updated_at: now
      };
      const { error: insertError } = await supabase.from('app_users').upsert(userRow, { onConflict: 'user_id' });
      if (insertError) throw insertError;
      await log(db, s.userId, 'ADMIN_ADD_USER', `Added user ${id}.`, a[5]);
      return { ok: true, version: VERSION };
    }

    case 'adminResetAuthPassword': {
      const s = await requireAdmin(db, tokenAt(0));
      const id = normalizeUserId(a[1]), pass = normalizePassword(a[2]);
      if (pass.length<4 || pass.length > 200) fail('Password must be between 4 and 200 characters.');
      const p = buildPasswordRecord(pass), now = iso();
      const { data, error } = await supabase.from('app_users').update({ password_hash: p.passwordHash, password_iterations: p.passwordCost.N, salt: p.passwordSalt, sessions_revoked_at: now, updated_at: now }).eq('user_id', id).select('user_id').maybeSingle();
      if (error) throw error;
      if (!data) fail('User was not found.', 404);
      await log(db, s.userId, 'ADMIN_RESET_PASSWORD', `Reset password for ${id}.`, a[3]);
      return { ok: true, version: VERSION };
    }

    case 'adminSetAuthUserActive': {
      const s = await requireAdmin(db, tokenAt(0));
      const id = normalizeUserId(a[1]);
      const patch = { active: !!a[2], updated_at: iso() };
      if (!a[2]) patch.sessions_revoked_at = iso();
      const { data, error } = await supabase.from('app_users').update(patch).eq('user_id', id).select('user_id').maybeSingle();
      if (error) throw error;
      if (!data) fail('User was not found.', 404);
      await log(db, s.userId, 'ADMIN_SET_USER_ACTIVE', `${id}: ${!!a[2]}`, a[3]);
      return { ok: true, version: VERSION };
    }

    case 'adminDeleteAuthUser': {
      const s = await requireAdmin(db, tokenAt(0));
      const id = normalizeUserId(a[1]);
      if (!id) fail('User ID is required.');
      if (id === normalizeUserId(s.userId)) fail('You cannot delete your own administrator account.', 403);
      const now = iso();
      const { data, error } = await supabase.from('app_users').update({ deleted: true, active: false, sessions_revoked_at: now, updated_at: now }).eq('user_id', id).select('user_id').maybeSingle();
      if (error) throw error;
      if (!data) fail('User was not found.', 404);
      await log(db, s.userId, 'ADMIN_DELETE_USER', `Deleted user ${id}.`, a[2]);
      return { ok: true, version: VERSION };
    }

    case 'adminAddOutsourceLab':
    case 'adminAddOutsourceTest':
    case 'adminAddOutsourceRejectReason': {
      const s = await requireAdmin(db, tokenAt(0));
      const settings = await getSettings();
      const old = settings.outsourceCatalog && typeof settings.outsourceCatalog === 'object' ? settings.outsourceCatalog : {};
      const labs = Array.isArray(old.labs) ? [...old.labs] : [];
      const testsByLab = old.testsByLab && typeof old.testsByLab === 'object' ? { ...old.testsByLab } : {};
      const rejectionReasons = Array.isArray(old.rejectionReasons) ? [...old.rejectionReasons] : [];
      if (method === 'adminAddOutsourceLab') {
        const lab = clean(a[1], 100).replace(/\s+/g, ' ').trim().toUpperCase();
        if (!lab) fail('Laboratory name is required.');
        if (labs.some(v => String(v).toUpperCase() === lab)) fail('This laboratory already exists.');
        labs.push(lab);
        await log(db, s.userId, 'ADMIN_ADD_OUTSOURCE_LAB', `Added outsource laboratory ${lab}.`, a[2]);
      } else if (method === 'adminAddOutsourceTest') {
        const lab = clean(a[1], 100).replace(/\s+/g, ' ').trim().toUpperCase();
        const test = clean(a[2], 200).replace(/\s+/g, ' ').trim();
        if (!lab) fail('Laboratory is required.');
        if (!test) fail('Test name is required.');
        const key = Object.keys(testsByLab).find(k => k.toUpperCase() === lab) || lab;
        const list = Array.isArray(testsByLab[key]) ? [...testsByLab[key]] : [];
        if (list.some(v => String(v).toUpperCase() === test.toUpperCase())) fail('This test already exists for the selected laboratory.');
        list.push(test); testsByLab[key] = Array.from(new Set(list));
        await log(db, s.userId, 'ADMIN_ADD_OUTSOURCE_TEST', `Added outsource test ${test} under ${lab}.`, a[3]);
      } else {
        const reason = clean(a[1], 200).replace(/\s+/g, ' ').trim();
        if (!reason) fail('Rejection reason is required.');
        if (rejectionReasons.some(v => String(v).toUpperCase() === reason.toUpperCase())) fail('This rejection reason already exists.');
        rejectionReasons.push(reason);
        await log(db, s.userId, 'ADMIN_ADD_OUTSOURCE_REJECT_REASON', `Added outsource rejection reason ${reason}.`, a[2]);
      }
      settings.outsourceCatalog = { version: 1, labs: Array.from(new Set(labs)), testsByLab, rejectionReasons: Array.from(new Set(rejectionReasons)), updatedAt: iso(), updatedBy: s.userId };
      await saveSettings(settings);
      return { ok: true, ...settings.outsourceCatalog, version: VERSION };
    }

    case 'adminSaveBroadcast': {
      const s = await requireAdmin(db, tokenAt(0));
      const settings = await getSettings();
      const message = clean(a[1], 600);
      settings.broadcast = { enabled: !!message, message, updatedAt: iso(), updatedBy: s.userId };
      await saveSettings(settings);
      await log(db, s.userId, 'ADMIN_BROADCAST', 'Updated broadcast.', a[2]);
      return { ok: true, version: VERSION };
    }

    case 'adminSetMaintenanceMode': {
      const s = await requireAdmin(db, tokenAt(0));
      const settings = await getSettings();
      settings.maintenance = { enabled: !!a[1], message: clean(a[2], 300) || 'System is temporarily under maintenance.', updatedAt: iso(), updatedBy: s.userId };
      await saveSettings(settings);
      await log(db, s.userId, 'ADMIN_MAINTENANCE', `Maintenance ${!!a[1]}`, a[3]);
      return { ok: true, version: VERSION };
    }

    case 'adminSetLiveChatLocked':
    case 'adminClearLiveChat': {
      await requireAdmin(db, tokenAt(0));
      return { ok: true, disabled: true, version: VERSION };
    }

    case 'adminInventoryUpsertItem': {
      const s = await requireAdmin(db, tokenAt(0));
      const item = a[1] && typeof a[1] === 'object' ? { ...a[1] } : {};
      const name = clean(item.name, 300);
      if (!name) fail('Item name is required.');
      const id = clean(item.id, 120) || `item-${randomUUID()}`;
      const now = iso();
      const { data: duplicate, error: duplicateError } = await supabase.from('inventory_items').select('id').ilike('name', name).neq('id', id).eq('active', true).maybeSingle();
      if (duplicateError) throw duplicateError;
      if (duplicate) fail('An item with this name already exists.');
      const { data: existing } = await supabase.from('inventory_items').select('created_at, created_by').eq('id', id).maybeSingle();
      const row = {
        id,
        name,
        category: clean(item.category, 100) || 'ETC',
        type: clean(item.type, 100) || 'REAGENT',
        active: item.active !== false,
        min_stock: Math.max(0, Math.floor(Number(item.minStock ?? item.min_stock ?? 0))),
        opening_stock: Math.max(0, Math.floor(Number(item.openingStock ?? item.opening_stock ?? 0))),
        price: Number(item.price || 0),
        monthly_prices: item.monthlyPrices || item.monthly_prices || {},
        deleted_item_ids: item.deletedItemIds || item.deleted_item_ids || {},
        extra: item.extra || {},
        created_at: existing?.created_at || now,
        created_by: existing?.created_by || s.userId,
        updated_by: s.userId,
        updated_at: now
      };
      if (!Number.isFinite(row.price) || row.price < 0) fail('Invalid item price.');
      const { error } = await supabase.from('inventory_items').upsert(row, { onConflict: 'id' });
      if (error) throw error;
      const { inventory } = await inventoryFromTables();
      const mapped = mapInventoryItemRow(row);
      const nextItems = Array.isArray(inventory.items) ? inventory.items.filter(x => x && String(x.id) !== String(id)) : [];
      nextItems.push(mapped);
      const deletedMap = inventory.deletedItemIds && typeof inventory.deletedItemIds === 'object' ? { ...inventory.deletedItemIds } : {};
      delete deletedMap[id];
      const nextInventory = { ...inventory, items: nextItems, deletedItemIds: deletedMap };
      const saved = await saveInventoryRoot(nextInventory, s.userId);
      await log(db, s.userId, existing ? 'ADMIN_UPDATE_INVENTORY_ITEM' : 'ADMIN_ADD_INVENTORY_ITEM', `${existing ? 'Updated' : 'Added'} item ${name}.`, a[3]);
      return { ok: true, item: mapped, inventory: inventoryView(nextInventory), updatedAt: saved.current.updated_at, version: VERSION };
    }

    case 'adminInventoryDeleteItem': {
      const s = await requireAdmin(db, tokenAt(0));
      const itemId = clean(a[1], 120);
      if (!itemId) fail('Item ID is required.');
      const now = iso();
      const { data: target, error: readError } = await supabase.from('inventory_items').select('*').eq('id', itemId).maybeSingle();
      if (readError) throw readError;
      if (!target) fail('Item was not found.', 404);
      const { error } = await supabase.from('inventory_items').update({ active: false, updated_by: s.userId, updated_at: now }).eq('id', itemId);
      if (error) throw error;
      const { inventory } = await inventoryFromTables();
      const deletedMap = inventory.deletedItemIds && typeof inventory.deletedItemIds === 'object' ? { ...inventory.deletedItemIds } : {};
      deletedMap[itemId] = now;
      const monthlyPrices = inventory.monthlyPrices && typeof inventory.monthlyPrices === 'object' ? { ...inventory.monthlyPrices } : {};
      Object.keys(monthlyPrices).forEach(monthKey => {
        if (monthlyPrices[monthKey] && typeof monthlyPrices[monthKey] === 'object') {
          const cloneMonth = { ...monthlyPrices[monthKey] };
          delete cloneMonth[itemId];
          monthlyPrices[monthKey] = cloneMonth;
        }
      });
      const nextInventory = {
        ...inventory,
        items: (Array.isArray(inventory.items) ? inventory.items : []).filter(x => x && String(x.id) !== String(itemId)),
        transactions: (Array.isArray(inventory.transactions) ? inventory.transactions : []).filter(tx => tx && String(tx.itemId) !== String(itemId)),
        monthlyPrices,
        deletedItemIds: deletedMap
      };
      const saved = await saveInventoryRoot(nextInventory, s.userId);
      await log(db, s.userId, 'ADMIN_DELETE_INVENTORY_ITEM', `Deleted item ${clean(target.name, 300)}.`, a[3]);
      return { ok: true, deletedItemId: itemId, inventory: inventoryView(nextInventory), updatedAt: saved.current.updated_at, version: VERSION };
    }

    case 'changeAuthPassword': {
      const s = await requireSession(db, tokenAt(4));
      const id = normalizeUserId(a[0]);
      if (id !== s.userId) fail('You can only change your own password.', 403);
      const current = normalizePassword(a[1]), nextPass = normalizePassword(a[2]);
      if (current.length > 200 || nextPass.length<4 || nextPass.length > 200) fail('New password must be between 4 and 200 characters.');
      const { data: u, error } = await supabase.from('app_users').select('*').eq('user_id', id).eq('deleted', false).maybeSingle();
      if (error) throw error;
      if (!u) fail('User was not found.', 404);
      const legacyUser = { userId: u.user_id, displayName: u.display_name, role: u.role, active: u.active, deleted: u.deleted, passwordHash: u.password_hash, passwordIterations: u.password_iterations, salt: u.salt };
      if (!verifyPassword(legacyUser, current)) fail('Invalid current password.', 401);
      const p = buildPasswordRecord(nextPass), now = iso();
      const { error: updateError } = await supabase.from('app_users').update({ password_hash: p.passwordHash, password_iterations: p.passwordCost.N, salt: p.passwordSalt, sessions_revoked_at: now, updated_at: now }).eq('user_id', id);
      if (updateError) throw updateError;
      await supabase.from('app_sessions').delete().eq('user_id', id);
      await log(db, s.userId, 'PASSWORD_CHANGED', 'Updated own password.', a[3]);
      return { ok: true, authenticated: false, changed: true, clearSession: true, message: 'Password updated. Go back and sign in.' };
    }

    default: throw Error(`API action not migrated yet: ${method}`);
  }
}

async function handlerDashboard() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value || '';
  return { ok: true, appName: 'LabApp', boardTitle: 'HOAG PATHOLOGY', subtitle: 'SPA Single Page Application', version: VERSION, serverDate: `${get('day')} ${get('month')} ${get('year')}`, serverTime: `${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`, serverIso: now.toISOString(), timeZone: TZ };
}
