import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { canReadTransfusionRecord, canWriteTransfusionRecord } from '../lib/transfusion-access.js';
import { inventoryView } from '../lib/inventory-view.js';
import { parseRequest } from '../lib/schemas/common.js';
import { transfusionRecordSchema, transfusionPatchSchema } from '../lib/schemas/transfusion.js';

const record = {
  id: 'tr-1', date: '2026-10-27', name: 'Example Patient', tt: '', idIc: '', sex: '', age: '',
  unit: '', bloodGroup: '', packNo: '', staff: '', googleDriveLink: '', remarks: '', notes: ''
};

test('transfusion record validation rejects extra fields and invalid clinical values', () => {
  assert.equal(parseRequest(transfusionRecordSchema, record).id, 'tr-1');
  assert.throws(() => parseRequest(transfusionRecordSchema, { ...record, createdBy: 'attacker' }), error => error.status === 400);
  assert.throws(() => parseRequest(transfusionRecordSchema, { ...record, age: '999' }), error => error.status === 400);
  assert.throws(() => parseRequest(transfusionPatchSchema, { record, expectedVersion: 0 }), error => error.status === 400);
});

test('transfusion reads and writes are limited to the record owner and administrators', () => {
  const owned = { createdBy: 'user-a', deletedAt: '' };
  assert.equal(canReadTransfusionRecord({ userId: 'user-a', role: 'USER' }, owned), true);
  assert.equal(canWriteTransfusionRecord({ userId: 'user-a', role: 'USER' }, owned), true);
  assert.equal(canReadTransfusionRecord({ userId: 'user-b', role: 'USER' }, owned), false);
  assert.equal(canWriteTransfusionRecord({ userId: 'user-b', role: 'USER' }, owned), false);
  assert.equal(canReadTransfusionRecord({ userId: 'user-b', role: 'ADMIN' }, owned), true);
  assert.equal(canWriteTransfusionRecord({ userId: 'user-b', role: 'ADMIN' }, owned), true);
  assert.equal(canReadTransfusionRecord({ userId: 'user-a', role: 'USER' }, { ...owned, deletedAt: '2026-10-27T00:00:00Z' }), false);
});

test('generic inventory API view strips the legacy transfusion copy without mutating the source', () => {
  const source = { items: [{ id: 'item-1' }], transfusionRecords: [{ id: 'patient-1' }], deletedTransfusionRecordIds: { x: true } };
  const view = inventoryView(source);
  assert.deepEqual(view, { items: [{ id: 'item-1' }] });
  assert.equal(source.transfusionRecords.length, 1);
  assert.equal(source.deletedTransfusionRecordIds.x, true);
});


test('transfusion module does not call its private cache loader from global login scope', () => {
  const app = fs.readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
  const moduleStart = app.indexOf('var Transfusion = (function () {');
  const moduleEnd = app.indexOf('var LabApp = {', moduleStart);
  const beforeModule = moduleStart >= 0 ? app.slice(0, moduleStart) : app;
  assert.doesNotMatch(beforeModule, /loadTransfusionCache\(\)/);
  assert.ok(moduleEnd > moduleStart);
});

test('legacy transfusion migration audit cannot make the read endpoint fail', () => {
  const api = fs.readFileSync(new URL('../api/transfusion.js', import.meta.url), 'utf8');
  assert.match(api, /try\s*\{\s*await audit\(db,actorId,'TRANSFUSION_DATA_MIGRATED'/);
  assert.match(api, /Transfusion migration audit skipped/);
});
