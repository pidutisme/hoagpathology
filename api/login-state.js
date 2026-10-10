
import { createHash } from "node:crypto";
import { firebaseDb } from "../lib/firebase-admin.js";
import { normalizeUserId } from "../lib/auth.js";

const SESSION_PATH = "labapp/auth/sessions";
const USERS_PATH = "labapp/auth/users";

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
    const token = String(req.body?.token ?? "").trim();

    if (!token || token.length > 300) {
      return res.status(401).json({
        ok: true,
        authenticated: false
      });
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
      return res.status(200).json({
        ok: true,
        authenticated: false
      });
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
      return res.status(200).json({
        ok: true,
        authenticated: false
      });
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
      return res.status(200).json({
        ok: true,
        authenticated: false
      });
    }

    return res.status(200).json({
      ok: true,
      authenticated: true,
      user: {
        id: userId,
        name: String(user.displayName || userId),
        role: String(user.role || "USER")
      },
      expiresAt: session.expiresAt,
      version: "2.1.4"
    });
  } catch (error) {
    console.error("Login state check failed:", error.message);

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "Unable to verify session."
    });
  }
}
