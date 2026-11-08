import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Secret, TOTP } from 'otpauth';
import { consumeRecoveryCode, consumeTotpCode, decryptTotpSecret, encryptTotpSecret, generateRecoveryCodes, matchingTotpCounter, newTotpSecret, recoveryCodeHash } from '../lib/mfa.js';

process.env.MFA_ENCRYPTION_KEY = randomBytes(32).toString('base64');

function fakeRef(initial) {
  let current = structuredClone(initial);
  return {
    get value() { return structuredClone(current); },
    async transaction(update) {
      const next = update(structuredClone(current));
      if (next !== undefined) current = structuredClone(next);
      return { committed: next !== undefined, snapshot: { val: () => structuredClone(current) } };
    },
    child(path) {
      return { transaction: async update => {
        const keys = path.split('/');
        let parent = current;
        for (const key of keys.slice(0, -1)) parent = parent?.[key];
        const leaf = keys.at(-1);
        const next = update(parent?.[leaf]);
        if (next !== undefined) {
          if (next === null) delete parent[leaf];
          else parent[leaf] = next;
        }
        return { committed: next !== undefined, snapshot: { val: () => parent?.[leaf] } };
      } };
    }
  };
}

test('TOTP accepts a current code and rejects malformed or expired codes', () => {
  const now = Date.now();
  const { secret } = newTotpSecret({ label: 'admin' });
  const totp = new TOTP({ issuer: 'Hoag Pathology', label: 'admin', algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secret) });
  const current = totp.generate({ timestamp: now });
  assert.notEqual(matchingTotpCounter(secret, current, now), null);
  assert.equal(matchingTotpCounter(secret, 'bad', now), null);
  const expired = totp.generate({ timestamp: now - 120000 });
  assert.equal(matchingTotpCounter(secret, expired, now), null);
});

test('TOTP codes cannot be replayed after atomic consumption', async () => {
  const now = Date.now();
  const { secret } = newTotpSecret({ label: 'admin' });
  const token = new TOTP({ issuer: 'Hoag Pathology', label: 'admin', algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secret) }).generate({ timestamp: now });
  const ref = fakeRef({ enabled: true, encryptedSecret: encryptTotpSecret(secret), lastCounter: -1 });
  assert.equal(await consumeTotpCode(ref, token, now), true);
  assert.equal(await consumeTotpCode(ref, token, now), false);
});

test('a transaction retry that loses the TOTP race is not reported as accepted', async () => {
  const now = Date.now();
  const { secret } = newTotpSecret({ label: 'admin' });
  const token = new TOTP({ issuer: 'Hoag Pathology', label: 'admin', algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secret) }).generate({ timestamp: now });
  const counter = matchingTotpCounter(secret, token, now);
  const current = { enabled: true, encryptedSecret: encryptTotpSecret(secret), lastCounter: -1 };
  const ref = { async transaction(update) { update(structuredClone(current)); update({ ...current, lastCounter: counter }); return { committed: false, snapshot: { val: () => ({ ...current, lastCounter: counter }) } }; } };
  assert.equal(await consumeTotpCode(ref, token, now), false);
});

test('MFA secrets are encrypted and recovery codes are one-time protected values', async () => {
  const secret = newTotpSecret({ label: 'admin' }).secret;
  const encrypted = encryptTotpSecret(secret);
  assert.notEqual(encrypted.ciphertext, secret);
  assert.equal(decryptTotpSecret(encrypted), secret);
  assert.throws(() => decryptTotpSecret({ ...encrypted, tag: randomBytes(16).toString('base64') }));
  const codes = generateRecoveryCodes();
  assert.equal(new Set(codes).size, 10);
  const ref = fakeRef({ recoveryHashes: { [recoveryCodeHash(codes[0])]: true } });
  assert.equal(await consumeRecoveryCode(ref, codes[0]), true);
  assert.equal(await consumeRecoveryCode(ref, codes[0]), false);
});
