# Hoag Pathology — Vercel/Firebase migration build

This build removes the Apps Script bridge from the browser application. Browser actions now call `/api/bridge`; the bridge handles authentication and application actions with Firebase Admin SDK. The old Apps Script catch-all proxy and diagnostic endpoints have been removed, leaving two Vercel function files (`api/bridge.js`, `api/health.js`).

## Required Vercel environment variables

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (newlines must be represented as `\\n` in the dashboard value)
- `FIREBASE_DATABASE_URL`

No legacy Apps Script URL environment variable is needed in this build.

## Before production use

1. Keep a backup of the existing GitHub repository and Firebase database.
2. Deploy to a preview deployment first.
3. Test login, refresh/session expiry, logout, password change, dashboard, holiday calendar, roster save/conflict, chat global/DM, reactions, notes CRUD/read state, Admin user management, maintenance mode, broadcast and chat lock.
4. Inspect Vercel function logs and Firebase paths after each test.
5. Do not delete the Apps Script project until parity and existing data have been verified.

## Important validation note

This is a migration build, not a claim of production parity. Several Apps Script behaviors depend on ScriptProperties/ScriptCache and helper logic that do not exist in Vercel. In particular, legacy ScriptProperties-only data, advanced chat reply/DM rules, per-user notes read/open state, full Malaysia holiday supplemental merging, and some Admin audit/maintenance semantics need comparison against the live app before switching production traffic. The existing Firebase data paths are preserved where present. The API intentionally returns an explicit error for any action not implemented in the Vercel dispatcher rather than forwarding to Apps Script.
