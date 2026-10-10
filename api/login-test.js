import { firebaseDb } from "../lib/firebase-admin.js";
import {
  normalizeUserId,
  normalizePassword,
  verifyPassword
} from "../lib/auth.js";

const SESSION_SECONDS = 21600;

function createToken() {
  return (
    crypto.randomUUID() +
    "." +
    crypto.randomUUID() +
    "." +
    Date.now()
  );
}

function publicUser(user) {
  return {
    id: String(user.userId || ""),
    name: String(user.displayName || user.name || ""),
    role: String(user.role || "")
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};

    const userId = normalizeUserId(body.username);
    const password = normalizePassword(body.password);

    if (!userId || !password) {
      return res.status(400).json({
        ok: false,
        authenticated: false,
        error: "Please enter your username and password."
      });
    }

    const db = firebaseDb();

    const snapshot = await db
      .ref("labapp/auth/users/users")
      .get();

    const users = snapshot.val() || {};

    const userEntry = Object.values(users).find(
      user =>
        normalizeUserId(user?.userId) === userId
    );

    if (!userEntry || userEntry.active === false) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    const passwordCheck = verifyPassword(
      userEntry,
      password
    );

    if (!passwordCheck) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    const token = createToken();

    const expiresAt = new Date(
      Date.now() + SESSION_SECONDS * 1000
    ).toISOString();

    return res.status(200).json({
      ok: true,
      authenticated: true,
      token,
      expiresAt,
      expiresIn: SESSION_SECONDS,
      user: publicUser(userEntry)
    });

  } catch (error) {
    console.error(
      "login-test failed:",
      error.message
    );

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "Login system error"
    });
  }
}
