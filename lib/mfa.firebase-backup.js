import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { Secret, TOTP } from 'otpauth';

function encryptionKey() {
  const value = process.env.MFA_ENCRYPTION_KEY || '';
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('MFA_ENCRYPTION_KEY must be a base64 encoded 32-byte key.');
  return key;
}

export function encryptTotpSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}

export function decryptTotpSecret(envelope) {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

export function newTotpSecret({ issuer = 'Hoag Pathology', label }) {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({ issuer, label, algorithm: 'SHA1', digits: 6, period: 30, secret });
  return { secret: secret.base32, uri: totp.toString() };
}

export function matchingTotpCounter(secretText, token, now = Date.now()) {
  if (!/^\d{6}$/.test(String(token || ''))) return null;
  const totp = new TOTP({ issuer: 'Hoag Pathology', label: 'admin', algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secretText) });
  const delta = totp.validate({ token: String(token), window: 1, timestamp: now });
  return delta === null ? null : Math.floor(now / 1000 / 30) + delta;
}

export function recoveryCodeHash(code) {
  return createHmac('sha256', encryptionKey()).update(String(code || '').trim().toUpperCase()).digest('hex');
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(10).toString('hex').toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
  });
}

export async function consumeTotpCode(ref, code, now = Date.now()) {
  let accepted = false;
  const result = await ref.transaction(current => {
    accepted = false;
    if (!current?.enabled || !current.encryptedSecret) return;
    let secret;
    try { secret = decryptTotpSecret(current.encryptedSecret); } catch { return; }
    const counter = matchingTotpCounter(secret, code, now);
    if (counter === null || counter <= Number(current.lastCounter ?? -1)) return;
    accepted = true;
    return { ...current, lastCounter: counter, lastUsedAt: new Date(now).toISOString() };
  });
  return Boolean(result?.committed && accepted);
}

export async function consumeRecoveryCode(ref, code) {
  const hash = recoveryCodeHash(code);
  let accepted = false;
  const result = await ref.child(`recoveryHashes/${hash}`).transaction(current => {
    accepted = false;
    if (current !== true) return;
    accepted = true;
    return null;
  });
  return Boolean(result?.committed && accepted);
}
