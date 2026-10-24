# Security hardening 1-5

Implemented in this package:

1. Firebase Realtime Database rules are supplied in `database.rules.json` and wired through `firebase.json`. API-only sensitive trees are deny-by-default; authenticated clients may read inventory, use their own presence/user-state, and read/write only their own notes.
2. CSP is added in `vercel.json`. External Firebase SDK, Google Fonts, Firebase services, Malaysia holiday API and Jina reader origins are explicitly allow-listed.
3. Authentication credentials are now delivered only as `HttpOnly; Secure; SameSite=Lax` cookies. The browser never receives the raw session token; legacy sessionStorage tokens are cleared.
4. Login failure counters use Firebase transactions to avoid lost updates under concurrent attempts.
5. Test suite was extended to cover password primitives, cookie-auth invariants, CSP/rules presence and protected API assumptions.

## Deployment requirement

The database rules are part of the package but must be deployed to the Firebase project before relying on the new direct-client restrictions:

```bash
firebase deploy --only database
```

Review the rules against any future direct Firebase paths before adding new client-side features.
