import {
  buildPasswordHash,
  normalizePassword,
  normalizePasswordIterations
} from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const testPassword = "Synthetic-Test-Only-123!";
  const testSalt = "synthetic-salt-for-testing-only";

  const expected = {
    2500: "REPLACE_AFTER_BASELINE",
    10000: "REPLACE_AFTER_BASELINE"
  };

  const cases = [2500, 10000].map(iterations => {
    const hash = buildPasswordHash(
      testSalt,
      testPassword,
      iterations
    );

    return {
      iterations,
      hashLength: hash.length,
      validHex: /^[a-f0-9]{64}$/.test(hash),
      iterationLimit: normalizePasswordIterations(iterations),
      hash
    };
  });

  return res.status(200).json({
    ok: cases.every(
      item =>
        item.hashLength === 64 &&
        item.validHex &&
        item.iterationLimit === item.iterations
    ),
    testType: "synthetic-only",
    passwordNormalizationWorks:
      normalizePassword("  Test  ") === "Test",
    cases
  });
}
