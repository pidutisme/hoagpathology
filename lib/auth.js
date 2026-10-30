import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const LEGACY_MAX_PASSWORD_ITERATIONS = 10000;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SCRYPT_MAXMEM = 32 * 1024 * 1024;

export function normalizeUserId(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toUpperCase()
    .slice(0, 60);
}

export function normalizePassword(value) {
  return String(value == null ? "" : value);
}

export function normalizePasswordIterations(iterations) {
  const value = Math.floor(Number(iterations || 1));
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(value, LEGACY_MAX_PASSWORD_ITERATIONS);
}

export function sha256Hex(value) {
  return createHash("sha256").update(String(value == null ? "" : value), "utf8").digest("hex");
}

export function buildLegacyPasswordHash(salt, password, iterations = 10000) {
  const passes = normalizePasswordIterations(iterations);
  let current = String(salt == null ? "" : salt).trim() + "\n" + normalizePassword(password);
  for (let i = 0; i < passes; i += 1) current = sha256Hex(current);
  return current;
}

export function buildPasswordRecord(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(normalizePassword(password), salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM
  });
  return {
    passwordScheme: 'scrypt',
    passwordSalt: salt.toString('base64'),
    passwordHash: hash.toString('base64'),
    passwordCost: { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, keylen: SCRYPT_KEYLEN }
  };
}

function verifyScrypt(user, password) {
  try {
    const salt = Buffer.from(String(user.passwordSalt || ''), 'base64');
    const stored = Buffer.from(String(user.passwordHash || ''), 'base64');
    if (salt.length < 16 || stored.length !== SCRYPT_KEYLEN) return false;
    const cost = user.passwordCost && typeof user.passwordCost === 'object' ? user.passwordCost : {};
    const N = Number(cost.N) || SCRYPT_N;
    const r = Number(cost.r) || SCRYPT_R;
    const p = Number(cost.p) || SCRYPT_P;
    const keylen = Number(cost.keylen) || SCRYPT_KEYLEN;
    if (N < 16384 || r < 8 || p < 1 || keylen !== SCRYPT_KEYLEN) return false;
    const actual = scryptSync(normalizePassword(password), salt, keylen, { N, r, p, maxmem: SCRYPT_MAXMEM });
    return actual.length === stored.length && timingSafeEqual(actual, stored);
  } catch (_) {
    return false;
  }
}

export function verifyPassword(user, password) {
  if (!user || typeof user !== 'object') return false;
  if (String(user.passwordScheme || '').toLowerCase() === 'scrypt') return verifyScrypt(user, password);

  const salt = String(user.salt ?? '');
  const storedHash = String(user.passwordHash ?? '').toLowerCase();
  if (!salt || !/^[a-f0-9]{64}$/.test(storedHash)) return false;
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(buildLegacyPasswordHash(salt, password, user.passwordIterations || user.hashIterations || 1), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function isLegacyPassword(user) {
  return !!user && String(user.passwordScheme || '').toLowerCase() !== 'scrypt';
}
