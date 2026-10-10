
import { createHash, timingSafeEqual } from "node:crypto";

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

export function sha256Hex(value) {
  return createHash("sha256")
    .update(String(value), "utf8")
    .digest("hex");
}

export function buildPasswordHash(salt, password, iterations) {
  const passes = Math.max(
    1,
    Math.min(10000, Math.floor(Number(iterations) || 1))
  );

  let current =
    `${String(salt ?? "").trim()}\n${normalizePassword(password)}`;

  for (let i = 0; i < passes; i++) {
    current = sha256Hex(current);
  }

  return current;
}

export function verifyPassword(user, password) {
  if (
    !user ||
    !user.salt ||
    !/^[a-f0-9]{64}$/i.test(String(user.passwordHash ?? ""))
  ) {
    return false;
  }

  const expected = Buffer.from(
    String(user.passwordHash).toLowerCase(),
    "hex"
  );

  const actual = Buffer.from(
    buildPasswordHash(
      user.salt,
      password,
      user.passwordIterations || user.hashIterations || 1
    ),
    "hex"
  );

  return expected.length === actual.length &&
    timingSafeEqual(expected, actual);
}
