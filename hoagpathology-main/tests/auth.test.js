import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPasswordRecord, buildLegacyPasswordHash, verifyPassword, isLegacyPassword } from '../lib/auth.js';

test('scrypt password records verify correctly', () => {
  const record = buildPasswordRecord('TestPass123');
  assert.equal(record.passwordScheme, 'scrypt');
  assert.equal(verifyPassword(record, 'TestPass123'), true);
  assert.equal(verifyPassword(record, 'wrong'), false);
  assert.equal(isLegacyPassword(record), false);
});

test('legacy SHA-256 password records remain compatible', () => {
  const salt = 'a'.repeat(64);
  const record = { salt, passwordHash: buildLegacyPasswordHash(salt, 'LegacyPass123', 10000), passwordIterations: 10000 };
  assert.equal(verifyPassword(record, 'LegacyPass123'), true);
  assert.equal(verifyPassword(record, 'wrong'), false);
  assert.equal(isLegacyPassword(record), true);
});

test('scrypt record uses a fresh salt', () => {
  const a = buildPasswordRecord('same-password');
  const b = buildPasswordRecord('same-password');
  assert.notEqual(a.passwordSalt, b.passwordSalt);
  assert.notEqual(a.passwordHash, b.passwordHash);
});
