```js
import { randomUUID } from "node:crypto";
import { firebaseDb } from "../lib/firebase-admin.js";
import {
  normalizeUserId,
  normalizePassword,
  verifyPassword
} from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

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

    const user = Object.values(users).find(
      record =>
        record &&
        normalizeUserId(record.userId) === userId
    );

    if (!user || user.active !== true) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    const passwordValid = verifyPassword(user, password);

    if (!passwordValid) {
      return res.status(401).json({
        ok: false,
        authenticated: false,
        error: "Invalid username or password."
      });
    }

    // TEST ONLY:
    // This token is not saved or validated as a server-side session.
    const testToken =
      randomUUID() + "." +
      randomUUID() + "." +
      Date.now();

    return res.status(200).json({
      ok: true,
      authenticated: true,
      testOnly: true,
      message: "Credentials verified successfully.",
      testToken,
      user: {
        id: String(user.userId || ""),
        name: String(user.displayName || user.name || ""),
        role: String(user.role || "")
      }
    });
  } catch (error) {
    // Do not log the submitted username, password or token.
    console.error(
      "login-test failed:",
      error?.message || "Unknown error"
    );

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error: "Login system error"
    });
  }
}
```
