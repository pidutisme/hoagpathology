
import { randomUUID, createHash } from "node:crypto";
import { firebaseDb } from "../lib/firebase-admin.js";
import { normalizeUserId, verifyPassword } from "../lib/auth.js";

const SESSION_SECONDS = 6 * 60 * 60;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      authenticated: false,
      error: "Method not allowed"
    });
  }

  try {
    const username = normalizeUserId(req.body?.username);
    const password = String(req.body?.password ?? "");

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        authenticated: false,
        error: "Please enter your username and password."
      });
    }

    const db = firebaseDb();
    const snapshot = await db.ref("labapp/auth/users").get();
    const stored = snapshot.val();

    const users = Array.isArray(stored?.users)
      ? stored.users
      : stored && typeof stored === "object"
        ? Object.values(stored).filter(
            item => item && typeof item === "object"
              && (item.userId || item.id || item.username)
          )
        : [];

    const user = users.find(
      item => normalizeUserId(item.userId || item.id || item.username) === username
        && item.deleted !== true
    );

    // Use the same public error for missing, inactive, and incorrect accounts.
    if (!user || user.active === false || !verifyPassword(user, password)) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    const now = Date.now();
    const expiresAt = new Date(now + SESSION_SECONDS * 1000).toISOString();
    const token = `${randomUUID()}.${randomUUID()}.${now}`;
    const tokenHash = createHash("sha256")
      .update(`token\n${token}`, "utf8")
      .digest("hex");

    await db.ref(`labapp/auth/sessions/${tokenHash}`).set({
      userId: username,
      name: String(user.displayName || username),
      role: String(user.role || "USER"),
      issuedAt: new Date(now).toISOString(),
      expiresAt
    });

    return res.status(200).json({
      ok: true,
      authenticated: true,
      token,
      expiresAt,
      expiresIn: SESSION_SECONDS,
      user: {
        id: username,
        name: String(user.displayName || username),
        role: String(user.role || "USER")
      },
      version: "2.1.4"
    });
  } catch (error) {
    console.error("Login endpoint failed:", error.message);

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "An unexpected system error occurred during sign-in."
    });
  }
}
