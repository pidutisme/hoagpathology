
import { firebaseDb } from "../lib/firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const db = firebaseDb();

    const paths = [
      "labapp/auth/users",
      "labapp/roster/team",
      "labapp/liveChat/messages",
      "labapp/notes/items",
      "labapp/notes/userState",
      "labapp/systemLogs"
    ];

    const results = {};

    for (const path of paths) {
      const snapshot = await db.ref(path).get();

      results[path] = {
        readable: true,
        exists: snapshot.exists(),
        type: snapshot.exists()
          ? (Array.isArray(snapshot.val())
              ? "array"
              : typeof snapshot.val())
          : "empty"
      };
    }

    return res.status(200).json({
      ok: true,
      service: "Firebase Admin SDK",
      checks: results
    });
  } catch (error) {
    console.error("Firebase path check failed:", error.message);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
