import { getDatabase } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const db = getDatabase();

    const snapshot = await db
      .ref("labapp/auth/users/users")
      .once("value");

    const users = snapshot.val() || {};

    const metadata = Object.entries(users).map(([key, user]) => ({
      key,
      hasUserId: !!user?.userId,
      hasSalt: !!user?.salt,
      hasPasswordHash: !!user?.passwordHash,
      passwordIterations:
        user?.passwordIterations ??
        user?.hashIterations ??
        null,
      active:
        user?.active ??
        user?.isActive ??
        null
    }));

    return res.status(200).json({
      ok: true,
      testType: "read-only-auth-metadata",
      userCount: metadata.length,
      users: metadata
    });
  } catch (error) {
    console.error("auth-users-test failed:", error);

    return res.status(500).json({
      ok: false,
      error: "Firebase read failed"
    });
  }
}
