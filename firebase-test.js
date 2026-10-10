
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

    // Read-only test: do not modify existing database data.
    await db.ref(".info/connected").get();

    return res.status(200).json({
      ok: true,
      service: "Firebase Admin SDK",
      message: "Firebase connection test completed"
    });
  } catch (error) {
    console.error("Firebase connection test failed:", error.message);

    return res.status(500).json({
      ok: false,
      error: "Firebase connection failed. Check server configuration."
    });
  }
}
