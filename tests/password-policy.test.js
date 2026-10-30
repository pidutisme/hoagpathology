import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePassword, buildPasswordRecord, verifyPassword } from '../lib/auth.js';

test('password normalization preserves leading and trailing whitespace', () => {
  const password = '  exact password  ';
  assert.equal(normalizePassword(password), password);
  const record = buildPasswordRecord(password);
  assert.equal(verifyPassword(record, password), true);
  assert.equal(verifyPassword(record, password.trim()), false);
});
