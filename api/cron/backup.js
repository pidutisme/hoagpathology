import { createHash, timingSafeEqual } from 'node:crypto';
import { put } from '@vercel/blob';
import { encryptBackup } from '../../lib/backup-crypto.js';
import { ensureRequestId } from '../../lib/request-security.js';
import { appendSystemLog } from '../../lib/session.js';
import { supabase } from '../../lib/supabase-admin.js';

const PREFIX = 'backups/hoagpathology/';
const dayKey = date => date.toISOString().slice(0, 10);
const audit = (action, requestId, detail = '') => appendSystemLog(null, { at: new Date().toISOString(), actorId: 'SYSTEM', action, details: detail, result: action.endsWith('FAILED') ? 'FAILURE' : 'SUCCESS', requestId, metadata: {} });
function authorized(req) {
  const expected = Buffer.from(process.env.CRON_SECRET || '');
  const supplied = Buffer.from(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  return expected.length >= 32 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  ensureRequestId(req, res);
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false, error: 'Method not allowed', requestId: req.requestId }); }
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized scheduled backup request.', requestId: req.requestId });
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.BACKUP_ENCRYPTION_KEY) return res.status(503).json({ ok: false, error: 'Backup storage is not configured.', requestId: req.requestId });
  try {
    const tables = {};
const readAll = async table => {
  const pageSize = 1000;
  const rows = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) throw error;

    rows.push(...(data || []));

    if (!data || data.length < pageSize) break;
  }

  return rows;
};

for (const table of [
  'app_users',
  'app_sessions',
  'app_settings',
  'app_roster',
  'inventory_items',
  'app_inventory',
  'outsource_records',
  'transfusion_records',
  'system_logs',
  'user_mfa'
]) {
  tables[table] = await readAll(table);
}
const raw = Buffer.from(JSON.stringify({ version: 1, source: 'supabase', tables }), 'utf8');
    const encrypted = encryptBackup(raw);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const kinds = ['daily'];
    if (now.getUTCDay() === 0) kinds.push('weekly');
    if (now.getUTCDate() === 1) kinds.push('monthly');
    const uploads = await Promise.all(kinds.map(kind => put(`${PREFIX}${kind}/${dayKey(now)}/${timestamp}.json.enc`, encrypted, { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/octet-stream' })));
    await audit('BACKUP_SUCCEEDED', req.requestId, `Encrypted snapshots: ${kinds.join(', ')}.`);
    return res.status(200).json({ ok: true, requestId: req.requestId, created: uploads.map(blob => ({ pathname: blob.pathname, size: blob.size })), retention: { deleted: 0 } });
  } catch (error) {
    try { await audit('BACKUP_FAILED', req.requestId, 'Scheduled backup failed.'); }
    catch (auditError) { console.error('Backup failure audit append failed:', 'requestId=' + req.requestId, auditError?.message || 'Unknown error'); }
    console.error('Scheduled backup failed:', 'requestId=' + req.requestId, error?.message || 'Unknown error');
    return res.status(500).json({ ok: false, error: 'Scheduled backup failed.', requestId: req.requestId });
  }
}
