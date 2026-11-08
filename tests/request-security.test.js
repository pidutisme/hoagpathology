import test from 'node:test';
import assert from 'node:assert/strict';
import { isSameOriginRequest } from '../lib/request-security.js';

test('cookie-authenticated write routes accept only matching secure origins', () => {
  assert.equal(isSameOriginRequest({ headers: { origin: 'https://lab.example', host: 'lab.example' } }), true);
  assert.equal(isSameOriginRequest({ headers: { origin: 'https://attacker.example', host: 'lab.example' } }), false);
  assert.equal(isSameOriginRequest({ headers: { host: 'lab.example' } }), false);
  assert.equal(isSameOriginRequest({ headers: { origin: 'http://lab.example', host: 'lab.example' } }), false);
  assert.equal(isSameOriginRequest({ headers: { origin: 'http://localhost:3000', host: 'localhost:3000' } }), true);
});
