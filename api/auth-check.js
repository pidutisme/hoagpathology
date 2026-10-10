
import { firebaseDb } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const snapshot = await firebaseDb()
      .ref("labapp/auth/users")
      .get();

    const value = snapshot.val();

    const users = Array.isArray(value?.users)
      ? value.users
      : value && typeof value === "object"
        ? Object.values(value).filter(
            item => item && typeof item === "object"
              && ("userId" in item || "passwordHash" in item)
          )
        : [];

    return res.status(200).json({
      ok: true,
      pathExists: snapshot.exists(),
      recordCount: users.length,
      recordsWithPasswordHash: users.filter(
        user => typeof user.passwordHash === "string"
          && user.passwordHash.length > 0
      ).length,
      recordsWithSalt: users.filter(
        user => typeof user.salt === "string"
          && user.salt.length > 0
      ).length
    });
  } catch (error) {
    console.error("Auth structure check failed:", error.message);

    return res.status(500).json({
      ok: false,
      error: "Unable to inspect auth data structure"
    });
  }
}
