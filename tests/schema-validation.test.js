import test from 'node:test';
import assert from 'node:assert/strict';
import { identifierSchema, isoDateSchema, parseRequest } from '../lib/schemas/common.js';
import { bridgeRequestSchema, loginRequestSchema, loginStateRequestSchema, outsourceRecordSchema } from '../lib/schemas/api.js';

test('login schema rejects missing fields, oversized passwords, and unexpected properties', () => {
  assert.equal(loginRequestSchema.safeParse({ username: 'staff' }).success, false);
  assert.equal(loginRequestSchema.safeParse({ username: 'staff', password: 'x'.repeat(201) }).success, false);
  assert.equal(loginRequestSchema.safeParse({ username: 'staff', password: 'correct horse battery staple', role: 'ADMIN' }).success, false);
  assert.equal(loginRequestSchema.safeParse({ username: 'staff', password: 'correct horse battery staple' }).success, true);
});

test('login-state schema accepts only the fresh-session marker, never client tokens', () => {
  assert.equal(loginStateRequestSchema.safeParse({}).success, true);
  assert.equal(loginStateRequestSchema.safeParse({ freshSession: true }).success, true);
  assert.equal(loginStateRequestSchema.safeParse({ token: 'client-supplied-token' }).success, false);
});

test('bridge envelope limits actions and rejects unknown properties and oversized arrays', () => {
  assert.equal(bridgeRequestSchema.safeParse({ action: 'action', payload: { method: 'getDashboardData', args: [] } }).success, true);
  assert.equal(bridgeRequestSchema.safeParse({ action: 'arbitrary', payload: {} }).success, false);
  assert.equal(bridgeRequestSchema.safeParse({ action: 'action', payload: { method: 'x', args: [], admin: true } }).success, false);
  assert.equal(bridgeRequestSchema.safeParse({ action: 'action', payload: { method: 'x', args: Array(101).fill(null) } }).success, false);
});

test('identifiers reject path traversal and prototype-pollution names', () => {
  for (const id of ['', '../users', '__proto__', 'constructor', 'has/slash']) assert.equal(identifierSchema.safeParse(id).success, false);
  assert.equal(identifierSchema.safeParse('sample-01').success, true);
});

test('dates reject impossible calendar dates and malformed strings', () => {
  for (const value of ['2026-02-30', '2026-13-01', 'yesterday', '2026-1-1']) assert.equal(isoDateSchema.safeParse(value).success, false);
  assert.equal(isoDateSchema.safeParse('2024-02-29').success, true);
});

test('strict outsource schema rejects invalid enum, dates, numeric abuse, XSS length abuse, and extra fields', () => {
  const row = { id: 'sample-1', sampleDate: '2026-10-26', barCode: '', name: 'Synthetic Patient', idIc: '', sex: '', age: '25', unit: '', dispatchDate: '', referral: '', lab: '', test: 'CBC', result: 'PENDING', resultDate: '', referenceNo: '', rejectReason: '', notes: '' };
  assert.equal(outsourceRecordSchema.safeParse(row).success, true);
  for (const bad of [
    { ...row, result: 'ROOT' },
    { ...row, sampleDate: 'not-a-date' },
    { ...row, age: 'Infinity' },
    { ...row, notes: '<script>'.repeat(300) },
    { ...row, createdBy: 'ADMIN' },
    { ...row, id: '__proto__' }
  ]) assert.equal(outsourceRecordSchema.safeParse(bad).success, false);
});

test('schema parse failures return safe client errors without echoing supplied values', () => {
  assert.throws(() => parseRequest(loginRequestSchema, { username: 's', password: '' }), error => error.status === 400 && error.message === 'Invalid request payload.' && !error.message.includes('password'));
});
