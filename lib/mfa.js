import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { Secret, TOTP } from 'otpauth';
import { supabase } from './supabase-admin.js';

function encryptionKey() {
  const value = process.env.MFA_ENCRYPTION_KEY || '';
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) {
    throw new Error('MFA_ENCRYPTION_KEY must be a base64 encoded 32-byte key.');
  }
  return key;
}

export function encryptTotpSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final()
  ]);

  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  };
}

export function decryptTotpSecret(envelope) {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(envelope.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
    decipher.final()
  ]).toString('utf8');
}

export function newTotpSecret({ issuer = 'Hoag Pathology', label }) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret
  });

  return {
    secret: secret.base32,
    uri: totp.toString()
  };
}

export function matchingTotpCounter(secretText, token, now = Date.now()) {
  if (!/^\d{6}$/.test(String(token || ''))) {
    return null;
  }

  const totp = new TOTP({
    issuer: 'Hoag Pathology',
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretText)
  });

  const delta = totp.validate({
    token: String(token),
    window: 1,
    timestamp: now
  });

  return delta === null
    ? null
    : Math.floor(now / 1000 / 30) + delta;
}

export function recoveryCodeHash(code) {
  return createHmac('sha256', encryptionKey())
    .update(String(code || '').trim().toUpperCase())
    .digest('hex');
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(10).toString('hex').toUpperCase();

    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
  });
}

export async function consumeTotpCode(userId, code, now = Date.now()) {
  const { data: current, error: readError } = await supabase
    .from('user_mfa')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) throw readError;

  if (!current?.enabled || !current.encrypted_secret) {
    return false;
  }

  let secret;

  try {
    secret = decryptTotpSecret(current.encrypted_secret);
  } catch {
    return false;
  }

  const counter = matchingTotpCounter(secret, code, now);

  if (
    counter === null ||
    counter <= Number(current.last_counter ?? -1)
  ) {
    return false;
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_mfa')
    .update({
      last_counter: counter,
      last_used_at: new Date(now).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('last_counter', Number(current.last_counter ?? -1))
    .select('user_id')
    .maybeSingle();

  if (updateError) throw updateError;

  return Boolean(updated?.user_id);
}

export async function consumeRecoveryCode(userId, code) {
  const hash = recoveryCodeHash(code);

  const { data: current, error: readError } = await supabase
    .from('user_mfa')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) throw readError;

  if (!current?.enabled || current.recovery_hashes?.[hash] !== true) {
    return false;
  }

  const recoveryHashes = { ...(current.recovery_hashes || {}) };
  delete recoveryHashes[hash];

  const { data: updated, error: updateError } = await supabase
    .from('user_mfa')
    .update({
      recovery_hashes: recoveryHashes,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('updated_at', current.updated_at)
    .select('user_id')
    .maybeSingle();

  if (updateError) throw updateError;

  return Boolean(updated?.user_id);
}