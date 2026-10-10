
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

    // Uji sambungan menggunakan root reference tanpa membaca semua data.
    await db.ref("/").get();

    return res.status(200).json({
      ok: true,
      service: "Firebase Admin SDK",
      message: "Firebase connection successful"
    });
  } catch (error) {
    console.error("Firebase connection test failed:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
      code: error.code || null
    });
  }
}
