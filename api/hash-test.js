import {
  buildPasswordHash,
  normalizePassword,
  verifyPassword
} from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const password = "Synthetic-Test-Only-123!";
  const salt = "synthetic-salt-for-testing-only";

  const testCases = [2500, 10000].map(iterations => {
    const passwordHash = buildPasswordHash(
      salt,
      password,
      iterations
    );

    const user = {
      userId: "SYNTHETIC",
      salt,
      passwordHash,
      passwordIterations: iterations
    };

    return {
      iterations,
      correctPassword: verifyPassword(
        user,
        password
      ),
      wrongPassword: verifyPassword(
        user,
        "Definitely-Wrong-Password!"
      ),
      normalizedPassword: normalizePassword(
        "  " + password + "  "
      )
    };
  });

  return res.status(200).json({
    ok: testCases.every(
      item =>
        item.correctPassword === true &&
        item.wrongPassword === false &&
        item.normalizedPassword === password
    ),
    testType: "synthetic-verify-only",
    cases: testCases
  });
}
