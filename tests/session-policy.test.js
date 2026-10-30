import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sessionFor } from '../lib/session.js';

function makeDb({ session, user, settings = {} }) {
  const tokenHash = createHash('sha256').update('token\ntest-token', 'utf8').digest('hex');
  const values = {
    [`labapp/auth/sessions/${tokenHash}`]: session,
    'labapp/auth/users': { users: user ? [user] : [] },
    'labapp/settings': settings
  };
  return { ref(path) { return { async get() { return { val: () => values[path] ?? null }; } }; } };
}
const validSession = () => ({ userId: 'TEST', issuedAt: new Date(Date.now() - 1000).toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString() });
const validUser = () => ({ userId: 'TEST', role: 'USER', active: true });

test('canonical session guard rejects expired, missing, disabled, deleted, revoked, and maintenance-blocked accounts', async () => {
  const expired = validSession(); expired.expiresAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(await sessionFor(makeDb({ session: expired, user: validUser() }), 'test-token'), null);
  assert.equal(await sessionFor(makeDb({ session: validSession(), user: null }), 'test-token'), null);
  assert.equal(await sessionFor(makeDb({ session: validSession(), user: { ...validUser(), active: false } }), 'test-token'), null);
  assert.equal(await sessionFor(makeDb({ session: validSession(), user: { ...validUser(), deleted: true } }), 'test-token'), null);
  assert.equal(await sessionFor(makeDb({ session: validSession(), user: { ...validUser(), sessionsRevokedAt: new Date().toISOString() } }), 'test-token'), null);
  assert.equal(await sessionFor(makeDb({ session: validSession(), user: validUser(), settings: { maintenance: { enabled: true } } }), 'test-token'), null);
  assert.equal((await sessionFor(makeDb({ session: validSession(), user: validUser() }), 'test-token'))?.userId, 'TEST');
});
