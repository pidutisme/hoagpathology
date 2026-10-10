```javascript
import { createHash, timingSafeEqual } from "node:crypto";

const MAX_PASSWORD_ITERATIONS = 10000;
const MIN_STORED_PASSWORD_ITERATIONS = 2500;

export function normalizeUserId(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toUpperCase()
    .slice(0, 60);
}

export function normalizePassword(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 200);
}

export function normalizePasswordIterations(iterations) {
  const value = Math.floor(Number(iterations || 1));

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.min(value, MAX_PASSWORD_ITERATIONS);
}

export function normalizeStoredPasswordIterations(iterations) {
  const value = Math.floor(Number(iterations || 1));

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.min(
    value,
    Math.max(
      MAX_PASSWORD_ITERATIONS,
      MIN_STORED_PASSWORD_ITERATIONS
    )
  );
}

export function sha256Hex(value) {
  return createHash("sha256")
    .update(String(value == null ? "" : value), "utf8")
    .digest("hex");
}

export function buildPasswordHash(salt, password, iterations) {
  const passes = normalizePasswordIterations(iterations);

  let current =
    `${String(salt == null ? "" : salt).trim()}\n` +
    normalizePassword(password);

  for (let i = 0; i < passes; i += 1) {
    current = sha256Hex(current);
  }

  return current;
}

export function verifyPassword(user, password) {
  if (!user || typeof user !== "object") {
    return false;
  }

  const salt = String(user.salt ?? "");
  const storedHash = String(user.passwordHash ?? "").toLowerCase();

  if (!salt || !/^[a-f0-9]{64}$/.test(storedHash)) {
    return false;
  }

  const iterations = normalizeStoredPasswordIterations(
    user.passwordIterations || user.hashIterations || 1
  );

  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(
    buildPasswordHash(salt, password, iterations),
    "hex"
  );

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}
```
