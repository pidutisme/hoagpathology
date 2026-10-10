
import { firebaseDb } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const snapshot = await firebaseDb()
      .ref("labapp/auth/users/users")
      .get();

    const value = snapshot.val();
    const users = Array.isArray(value)
      ? value.filter(user => user && typeof user === "object")
      : [];

    const iterationCounts = {};

    for (const user of users) {
      const iterations = Number(
        user.passwordIterations || user.hashIterations || 1
      );

      const key = String(
        Number.isFinite(iterations) && iterations > 0
          ? Math.floor(iterations)
          : 1
      );

      iterationCounts[key] = (iterationCounts[key] || 0) + 1;
    }

    return res.status(200).json({
      ok: true,
      recordCount: users.length,
      iterationCounts
    });
  } catch (error) {
    console.error("Auth metadata check failed:", error.message);

    return res.status(500).json({
      ok: false,
      error: "Unable to inspect authentication metadata"
    });
  }
}
