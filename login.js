
import { randomUUID, createHash } from "node:crypto";
import { firebaseDb } from "../lib/firebase-admin.js";
import {
  normalizeUserId,
  normalizePassword,
  verifyPassword
} from "../lib/auth.js";

const SESSION_SECONDS = 6 * 60 * 60;
const USERS_PATH = "labapp/auth/users";
const SESSIONS_PATH = "labapp/auth/sessions";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      authenticated: false,
      error: "Method not allowed"
    });
  }

  try {
    const body =
      req.body && typeof req.body === "object"
        ? req.body
        : {};

    const username = normalizeUserId(body.username);
    const password = normalizePassword(body.password);

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        authenticated: false,
        error: "Please enter your username and password."
      });
    }

    const db = firebaseDb();
    const snapshot = await db.ref(USERS_PATH).get();
    const stored = snapshot.val();

    const users = Array.isArray(stored?.users)
      ? stored.users
      : stored && typeof stored === "object"
        ? Object.values(stored).filter(
            item =>
              item &&
              typeof item === "object" &&
              (item.userId || item.id || item.username)
          )
        : [];

    const user = users.find(
      item =>
        normalizeUserId(
          item.userId || item.id || item.username
        ) === username &&
        item.deleted !== true
    );

    // Use the same public error for invalid accounts and passwords.
    if (
      !user ||
      user.active === false ||
      !verifyPassword(user, password)
    ) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    const now = Date.now();
    const issuedAt = new Date(now).toISOString();
    const expiresAt = new Date(
      now + SESSION_SECONDS * 1000
    ).toISOString();

    const token =
      `${randomUUID()}.${randomUUID()}.${now}`;

    // Store only a hash of the session token in Firebase.
    const tokenHash = createHash("sha256")
      .update(`token\n${token}`, "utf8")
      .digest("hex");

    const session = {
      userId: username,
      name: String(user.displayName || username),
      role: String(user.role || "USER"),
      issuedAt,
      expiresAt
    };

    await db
      .ref(`${SESSIONS_PATH}/${tokenHash}`)
      .set(session);

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
    // Never log passwords, submitted credentials or tokens.
    console.error(
      "Login endpoint failed:",
      error?.message || "Unknown error"
    );

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "An unexpected system error occurred during sign-in."
    });
  }
}
