
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { firebaseDb } from "../lib/firebase-admin.js";
import { normalizeUserId } from "../lib/auth.js";

const require = createRequire(import.meta.url);
const VERSION = require("../package.json").version || "0.0.0";
const SESSION_PATH = "labapp/auth/sessions";
const USERS_PATH = "labapp/auth/users";
const COOKIE_NAME = 'labapp_session';
const cookieValue = (req, name) => { const raw = String(req.headers.cookie || ''); const hit = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '=')); return hit ? decodeURIComponent(hit.slice(name.length + 1)) : ''; };
const clearSessionCookie = res => res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);

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
    // Authentication is stored only in an HttpOnly session cookie.
    // A cookie may be absent on the first request; that simply means logged out.
    const token = String(cookieValue(req, COOKIE_NAME) || '').trim();
    if (!token || token.length > 300) {
      return res.status(200).json({ ok: true, authenticated: false });
    }

    const tokenHash = createHash("sha256")
      .update(`token\n${token}`, "utf8")
      .digest("hex");

    const db = firebaseDb();

    const [sessionSnapshot, usersSnapshot] = await Promise.all([
      db.ref(`${SESSION_PATH}/${tokenHash}`).get(),
      db.ref(USERS_PATH).get()
    ]);

    if (!sessionSnapshot.exists()) {
      clearSessionCookie(res);
      return res.status(200).json({ ok: true, authenticated: false });
    }

    const session = sessionSnapshot.val();
    const userId = normalizeUserId(session?.userId);
    const expiresAt = Date.parse(session?.expiresAt);
    const issuedAt = Date.parse(session?.issuedAt);

    if (
      !userId ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now() ||
      !Number.isFinite(issuedAt)
    ) {
      clearSessionCookie(res);
      return res.status(200).json({ ok: true, authenticated: false });
    }

    const stored = usersSnapshot.val();
    const users = Array.isArray(stored?.users)
      ? stored.users
      : stored && typeof stored === "object"
        ? Object.values(stored).filter(
            item => item && typeof item === "object"
              && (item.userId || item.id || item.username)
          )
        : [];

    const user = users.find(
      item =>
        normalizeUserId(item.userId || item.id || item.username) === userId &&
        item.deleted !== true
    );

    if (
      !user ||
      user.active === false ||
      (
        Date.parse(user.sessionsRevokedAt || "") > 0 &&
        Date.parse(user.sessionsRevokedAt) >= issuedAt
      )
    ) {
      clearSessionCookie(res);
      return res.status(200).json({ ok: true, authenticated: false });
    }

    const result = {
      ok: true,
      authenticated: true,
      user: {
        id: userId,
        name: String(user.displayName || userId),
        role: String(user.role || 'USER')
      },
      expiresAt: session.expiresAt,
      version: VERSION
    };
    return res.status(200).json(result);
  } catch (error) {
    console.error("Login state check failed:", error.message);

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "Unable to verify session."
    });
  }
}
