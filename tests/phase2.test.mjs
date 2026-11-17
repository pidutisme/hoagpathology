import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  cleanTbisText,
  normalizeAfb,
  findSampleByAfb,
  hasSampleActivity,
  tbis102aOwnerMatches,
  requireTbis102aUpdatePermission,
  requireTbis102aDeletePermission,
  normalizeTbis102aRecord
} from '../lib/tbis102a.js';
import { hasPermission, requirePermission, permissionsForRole } from '../lib/permissions.js';
import { normalizeUserId, buildPasswordRecord, verifyPassword } from '../lib/auth.js';
import {
  canReadLegacyTransfusionRecord,
  canWriteLegacyTransfusionRecord,
  canReadTransfusionRecord,
  canWriteTransfusionRecord,
  canDeleteTransfusionRecord
} from '../lib/transfusion-access.js';
import { encryptBackup, decryptBackup } from '../lib/backup-crypto.js';
import { inventoryView } from '../lib/inventory-view.js';
import { isSameOriginRequest, cookieValue, isHttpsRequest } from '../lib/request-security.js';

const ROOT = process.cwd();

function referenceHistoricalCase() {
  return {
    id: 'tbis-hist-2026-001',
    bil: '12',
    date: '2026-02-01',
    labNo: 'LAB-X1-101',
    barcode: 'BC-X1-101',
    name: 'MOHAMAD HAFIZUDIN',
    idNo: '920304-06-5111',
    unit: 'WAD 2',
    patient: 'SIMPTOMATIK',
    createdAt: '2026-02-01T08:00:00.000Z',
    createdBy: 'Historical CSV Migration',
    updatedAt: '2026-02-03T10:00:00.000Z',
    updatedBy: 'SYSTEM',
    version: 3,
    deletedAt: '',
    samples: [
      {
        afb: 'X1',
        date: '2026-02-01',
        labNo: 'LAB-X1-101',
        barcode: 'BC-X1-101',
        sample: 'MORNING',
        quality: 'SPUTUM',
        result: '',
        observation: 'Direct smear OK',
        scanty: '',
        slideResult: 'NEG-SLIDE-1',
        patientResult: 'NEGATIVE',
        slide: 'SL-101',
        releaseDate: '2026-02-02',
        tat: '24',
        staff: 'LIZA',
        review: 'JAYANTHI',
        notes: 'Historical X1 note'
      },
      {
        afb: 'X2',
        date: '2026-02-02',
        labNo: 'LAB-X2-202',
        barcode: 'BC-X2-202',
        sample: 'SPOT',
        quality: 'SPUTUM',
        result: 'NO AFB SEEN',
        observation: 'Obs X2',
        scanty: '',
        slideResult: 'NEG-SLIDE-2',
        patientResult: 'NEGATIVE',
        slide: 'SL-202',
        releaseDate: '2026-02-03',
        tat: '18',
        staff: 'SURIANI',
        review: 'NAZRAN',
        notes: 'Historical X2 note'
      },
      {
        afb: 'X3',
        date: '',
        labNo: '',
        barcode: '',
        sample: '',
        quality: '',
        result: '',
        observation: 'Pending smear check',
        scanty: '',
        slideResult: '',
        patientResult: 'NEGATIVE',
        slide: 'SL-303',
        releaseDate: '',
        tat: '',
        staff: '',
        review: '',
        notes: 'Historical X3 hidden note'
      }
    ]
  };
}

test('TBIS102A: normalizeAfb & findSampleByAfb strictly match normalized afb without index fallback', () => {
  assert.equal(normalizeAfb(' x2 '), 'X2');
  assert.equal(normalizeAfb('invalid'), '');
  const reversed = [{ afb: 'x3', labNo: 'L3' }, { afb: 'X1', labNo: 'L1' }];
  assert.equal(findSampleByAfb(reversed, 'x1')?.labNo, 'L1');
  assert.equal(findSampleByAfb(reversed, 'x2'), null);
  assert.equal(findSampleByAfb(reversed, 'X3')?.labNo, 'L3');
});

test('TBIS102A: editing X2 preserves X1, X3, patientResult, hidden fields, and parent identity', () => {
  const existing = referenceHistoricalCase();
  const payload = {
    id: existing.id,
    name: existing.name,
    idNo: existing.idNo,
    unit: existing.unit,
    patient: existing.patient,
    date: existing.date,
    labNo: existing.labNo,
    barcode: existing.barcode,
    samples: [
      {
        afb: 'X2',
        date: '2026-02-04',
        labNo: 'LAB-X2-202-UPDATED',
        barcode: 'BC-X2-202-UPDATED',
        sample: 'MORNING',
        quality: 'SALIVA',
        result: 'SCANTY',
        scanty: '4',
        releaseDate: '2026-02-05',
        tat: '20',
        staff: 'JAPIDI',
        review: 'SHOUNNA'
      }
    ]
  };

  const saved = normalizeTbis102aRecord(payload, existing, 'HANI', '2026-02-06T09:00:00.000Z');
  assert.equal(saved.date, '2026-02-01');
  assert.equal(saved.labNo, 'LAB-X1-101');
  assert.equal(saved.barcode, 'BC-X1-101');
  assert.equal(saved.version, 4);

  const x1 = findSampleByAfb(saved.samples, 'X1');
  const x2 = findSampleByAfb(saved.samples, 'X2');
  const x3 = findSampleByAfb(saved.samples, 'X3');

  assert.equal(x1.patientResult, 'NEGATIVE');
  assert.equal(x1.observation, 'Direct smear OK');
  assert.equal(x1.slideResult, 'NEG-SLIDE-1');
  assert.equal(x1.slide, 'SL-101');
  assert.equal(x1.notes, 'Historical X1 note');

  assert.equal(x2.date, '2026-02-04');
  assert.equal(x2.labNo, 'LAB-X2-202-UPDATED');
  assert.equal(x2.result, 'SCANTY');
  assert.equal(x2.scanty, '4');
  assert.equal(x2.patientResult, 'NEGATIVE');
  assert.equal(x2.observation, 'Obs X2');
  assert.equal(x2.slideResult, 'NEG-SLIDE-2');
  assert.equal(x2.slide, 'SL-202');
  assert.equal(x2.notes, 'Historical X2 note');

  assert.equal(x3.date, '');
  assert.equal(x3.labNo, '');
  assert.equal(x3.patientResult, 'NEGATIVE');
  assert.equal(x3.observation, 'Pending smear check');
  assert.equal(x3.slide, 'SL-303');
  assert.equal(x3.notes, 'Historical X3 hidden note');
});

test('TBIS102A: editing existing blank/patientResult-only X3 does not fail with Result is required for X3', () => {
  const existing = referenceHistoricalCase();
  const payload = {
    id: existing.id,
    name: existing.name,
    samples: [
      {
        afb: 'X3',
        date: '2026-02-06',
        labNo: 'LAB-X3-303',
        barcode: 'BC-X3-303',
        sample: 'SPOT',
        quality: 'SPUTUM',
        result: ''
      }
    ]
  };
  const saved = normalizeTbis102aRecord(payload, existing, 'HANI');
  const x3 = findSampleByAfb(saved.samples, 'X3');
  assert.equal(x3.date, '2026-02-06');
  assert.equal(x3.labNo, 'LAB-X3-303');
  assert.equal(x3.patientResult, 'NEGATIVE');
  assert.equal(x3.result, '');
});

test('TBIS102A: genuinely blank existing X3 slot fails if newly populated without result or patientResult', () => {
  const existing = {
    id: 'tbis-blank-x3',
    date: '2026-05-01',
    name: 'TEST PATIENT',
    createdBy: 'HANI',
    samples: [
      { afb: 'X1', date: '2026-05-01', result: 'NO AFB SEEN' },
      { afb: 'X3' }
    ]
  };
  assert.equal(hasSampleActivity(findSampleByAfb(existing.samples, 'X3')), false);
  assert.throws(() => normalizeTbis102aRecord({
    id: existing.id,
    name: existing.name,
    samples: [{ afb: 'X3', date: '2026-05-03', labNo: 'L3', result: '' }]
  }, existing, 'HANI'), /Result is required for X3/);

  const untouchedX3Save = normalizeTbis102aRecord({
    id: existing.id,
    name: existing.name,
    samples: [{ afb: 'X1', date: '2026-05-01', labNo: 'L1-EDIT', result: 'NO AFB SEEN' }]
  }, existing, 'HANI');
  assert.equal(findSampleByAfb(untouchedX3Save.samples, 'X1').labNo, 'L1-EDIT');
  assert.equal(findSampleByAfb(untouchedX3Save.samples, 'X3').result, '');
});

test('TBIS102A: SCANTY requires positive integer >= 1 and clears scanty when changed away', () => {
  assert.throws(() => normalizeTbis102aRecord({
    id: 'tbis-scanty-1',
    date: '2026-06-01',
    name: 'PATIENT A',
    samples: [{ afb: 'X1', date: '2026-06-01', result: 'SCANTY', scanty: '0' }]
  }, null, 'HANI'), /positive integer numeric AFB count/);

  const scantyOk = normalizeTbis102aRecord({
    id: 'tbis-scanty-1',
    date: '2026-06-01',
    name: 'PATIENT A',
    samples: [{ afb: 'X1', date: '2026-06-01', result: 'SCANTY', scanty: '5' }]
  }, null, 'HANI');
  assert.equal(findSampleByAfb(scantyOk.samples, 'X1').scanty, '5');

  const cleared = normalizeTbis102aRecord({
    id: 'tbis-scanty-1',
    name: 'PATIENT A',
    samples: [{ afb: 'X1', date: '2026-06-01', result: 'NO AFB SEEN', scanty: '5' }]
  }, scantyOk, 'HANI');
  assert.equal(findSampleByAfb(cleared.samples, 'X1').scanty, '');
});

test('TBIS102A: editing X1 updates parent identity and preserves intentional clears', () => {
  const created = normalizeTbis102aRecord({
    id: 'tbis-parent-sync',
    date: '2026-03-01',
    name: 'PATIENT X',
    idNo: '900101-01-1234',
    samples: [{ afb: 'X1', date: '2026-03-01', labNo: 'L100', barcode: 'B100', result: 'NO AFB SEEN' }]
  }, null, 'HANI');
  assert.equal(created.labNo, 'L100');
  assert.equal(created.barcode, 'B100');

  const updated = normalizeTbis102aRecord({
    id: created.id,
    date: '2026-03-02',
    name: 'PATIENT X',
    idNo: '',
    samples: [{ afb: 'X1', date: '2026-03-02', labNo: 'L200', barcode: 'B200', result: '1+' }]
  }, created, 'HANI');
  assert.equal(updated.date, '2026-03-02');
  assert.equal(updated.labNo, 'L200');
  assert.equal(updated.barcode, 'B200');
  assert.equal(updated.idNo, '');
  assert.equal(cleanTbisText('hello\u0007 world'), 'hello world');
});

test('TBIS102A role permissions: USER edits any record, deletes only own non-historical records; VISITOR read-only; ADMIN full', () => {
  const adminSession = { userId: 'ADMIN', role: 'ADMIN' };
  const haniSession = { userId: 'HANI', role: 'USER', user: { userId: 'HANI', username: 'HANI' } };
  const visitorSession = { userId: 'VISITOR1', role: 'VISITOR' };

  const ownRecord = { id: '1', createdBy: 'HANI' };
  const otherRecord = { id: '2', createdBy: 'FAIZ' };
  const ownerlessRecord = { id: '3', createdBy: '' };
  const historicalRecord = { id: '4', createdBy: 'Historical CSV Migration' };

  assert.equal(tbis102aOwnerMatches(haniSession, ownRecord), true);
  assert.equal(tbis102aOwnerMatches(haniSession, otherRecord), false);
  assert.equal(tbis102aOwnerMatches(haniSession, ownerlessRecord), false);
  assert.equal(tbis102aOwnerMatches(haniSession, historicalRecord), false);

  // USER can UPDATE any TBIS102A record
  assert.doesNotThrow(() => requireTbis102aUpdatePermission(haniSession, ownRecord));
  assert.doesNotThrow(() => requireTbis102aUpdatePermission(haniSession, otherRecord));
  assert.doesNotThrow(() => requireTbis102aUpdatePermission(haniSession, historicalRecord));

  // USER can DELETE only own non-historical records
  assert.doesNotThrow(() => requireTbis102aDeletePermission(haniSession, ownRecord));
  assert.throws(() => requireTbis102aDeletePermission(haniSession, otherRecord));
  assert.throws(() => requireTbis102aDeletePermission(haniSession, ownerlessRecord));
  assert.throws(() => requireTbis102aDeletePermission(haniSession, historicalRecord));

  // ADMIN can UPDATE & DELETE all
  assert.doesNotThrow(() => requireTbis102aUpdatePermission(adminSession, historicalRecord));
  assert.doesNotThrow(() => requireTbis102aDeletePermission(adminSession, historicalRecord));
  assert.doesNotThrow(() => requireTbis102aDeletePermission(adminSession, otherRecord));

  // VISITOR cannot UPDATE or DELETE
  assert.throws(() => requireTbis102aUpdatePermission(visitorSession, ownRecord));
  assert.throws(() => requireTbis102aDeletePermission(visitorSession, ownRecord));
});

test('Shared backend security, permissions, auth, transfusion access, and backup crypto', () => {
  assert.equal(hasPermission({ userId: 'U1', role: 'USER' }, 'tbis102a.update.all'), true);
  assert.equal(hasPermission({ userId: 'U1', role: 'USER' }, 'tbis102a.delete.all'), false);
  assert.equal(hasPermission({ userId: 'V1', role: 'VISITOR' }, 'tbis102a.create'), false);
  assert.doesNotThrow(() => requirePermission({ userId: 'V1', role: 'VISITOR' }, 'tbis102a.read'));
  assert.throws(() => requirePermission({ userId: 'V1', role: 'VISITOR' }, 'tbis102a.create'));
  assert.ok(permissionsForRole('ADMIN').includes('admin.access'));

  assert.equal(normalizeUserId('  han i\u0007 '), 'HANI');
  const pwdRecord = buildPasswordRecord('CorrectHorseBattery9!');
  assert.equal(verifyPassword(pwdRecord, 'CorrectHorseBattery9!'), true);
  assert.equal(verifyPassword(pwdRecord, 'wrong-password'), false);

  const uSession = { userId: 'HANI', role: 'USER' };
  const aSession = { userId: 'ADMIN', role: 'ADMIN' };
  assert.equal(canReadTransfusionRecord(uSession, { createdBy: 'HANI' }), true);
  assert.equal(canWriteTransfusionRecord(uSession, { createdBy: 'OTHER' }), false);
  assert.equal(canDeleteTransfusionRecord(aSession, { createdBy: 'OTHER' }), true);
  assert.equal(canReadLegacyTransfusionRecord(uSession, { createdBy: 'Historical CSV Migration' }), true);
  assert.equal(canWriteLegacyTransfusionRecord(uSession, { createdBy: '' }), false);
  assert.equal(canWriteLegacyTransfusionRecord(aSession, { createdBy: '' }), true);

  process.env.BACKUP_ENCRYPTION_KEY = randomBytes(32).toString('base64');
  const cipher = encryptBackup(Buffer.from('hoag-pathology-test', 'utf8'));
  assert.equal(decryptBackup(cipher).toString('utf8'), 'hoag-pathology-test');

  const inv = inventoryView({ items: [{ id: 'i1' }], transfusionRecords: [{ id: 'secret' }], deletedTransfusionRecordIds: {} });
  assert.equal('transfusionRecords' in inv, false);
  assert.equal(cookieValue({ headers: { cookie: 'foo=1; labapp_session=abc%2Edef' } }, 'labapp_session'), 'abc.def');
  assert.equal(isHttpsRequest({ headers: { 'x-forwarded-proto': 'https' } }), true);
  assert.equal(isSameOriginRequest({ headers: { host: 'app.hoag.my', origin: 'https://app.hoag.my', 'x-forwarded-proto': 'https' } }), true);
  assert.equal(isSameOriginRequest({ headers: { host: 'app.hoag.my', origin: 'https://evil.example', 'x-forwarded-proto': 'https' } }), false);
});

test('Static codebase integrity: HTML, CSS tokens/braces, asset cleanup, and frontend regression invariants', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  const notifJs = fs.readFileSync(path.join(ROOT, 'assets/js/notification.js'), 'utf8');
  const loginJs = fs.readFileSync(path.join(ROOT, 'api/login.js'), 'utf8');
  const bridgeJs = fs.readFileSync(path.join(ROOT, 'api/bridge.js'), 'utf8');

  assert.equal(fs.existsSync(path.join(ROOT, 'lib/versioned-transaction.js')), false);
  assert.ok(html.includes(`content="${pkg.version}"`));
  assert.ok(html.includes('id="settingsSystemCheckSummary"'));
  assert.ok(html.includes('rel="apple-touch-icon"'));
  assert.equal(html.includes('liveChatMessageMenu'), false);
  assert.ok(!/Code\.gs/i.test(appJs));

  // MFA backend wiring check
  assert.ok(loginJs.includes("from('user_mfa')"));
  assert.ok(loginJs.includes('consumeTotpCode('));
  assert.ok(loginJs.includes('consumeRecoveryCode('));

  // Bridge imports lib/tbis102a.js cleanly
  assert.ok(bridgeJs.includes("from '../lib/tbis102a.js'"));

  // TBIS102A frontend split edit vs delete & pagination & no inline modal styles
  assert.equal(appJs.includes('function canModifyRecord('), false);
  assert.ok(appJs.includes('function canEditRecord('));
  assert.ok(appJs.includes('function canDeleteRecord('));
  assert.ok(appJs.includes('tbis102a-detail-span-2'));
  assert.equal(appJs.includes('transfusionRemarksText'), false);
  assert.equal(appJs.includes('_hoagTransfusionEyeDelegated'), false);
  assert.ok(notifJs.includes('fmtDate(r.notification_datetime || r.updated_at || r.created_at)'));
  assert.ok(notifJs.includes('data-notif-page="next"'));

  // CSS sanity: balanced braces, no undefined vars, no removed microscope ref
  const cssFiles = [
    'assets/css/app.css',
    'assets/css/auth-redesign.css',
    'assets/css/notification.css',
    'assets/css/responsive-tables.css'
  ];
  const definedVars = new Set();
  const usedVars = [];
  for (const rel of cssFiles) {
    const css = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    let depth = 0;
    for (const ch of css) {
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      assert.ok(depth >= 0, `Unmatched closing brace in ${rel}`);
    }
    assert.equal(depth, 0, `Unbalanced braces in ${rel}`);
    assert.equal(css.includes('login-microscope.jpg'), false, `Legacy image ref in ${rel}`);
    for (const m of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) definedVars.add(m[1]);
    for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) usedVars.push([rel, m[1]]);
  }
  const missingVars = usedVars.filter(([, name]) => !definedVars.has(name));
  assert.deepEqual(missingVars, [], `Undefined CSS variables found: ${JSON.stringify(missingVars)}`);
});
