# Security Hardening – 2.1.80

This build keeps the existing UI and CSS unchanged. The only frontend source change is the password-change request now supplying the authenticated session token required by the hardened API.

## Included fixes

- Replaced new password storage with Node.js `scrypt` using a random salt and memory-hard parameters.
- Preserved compatibility with existing legacy SHA-256 password records; successful legacy logins are upgraded automatically.
- Password changes require the authenticated current session and can only target that session's user.
- Session cookie is issued as `HttpOnly; Secure; SameSite=Lax` in addition to the existing client session flow.
- Login throttling now considers both a hashed username key and a hashed source-IP key.
- Login returns appropriate HTTP status codes for invalid credentials/rate limits.
- Server-side unexpected errors return a generic message instead of internal exception text.
- Chat message creation uses individual Firebase child writes and prunes old records, reducing lost-update races.
- Notes creation uses individual Firebase child writes.
- SPA documents are no longer cached by the service worker; this reduces stale deployments.
- Added Vercel security headers.
- Removed automatic GitHub Actions versioning so normal `main` pushes do not create a second commit/deployment.
- Added authentication regression tests.
- Application version remains manually controlled in `package.json`.

## Not changed

- UI markup/layout/styling was not redesigned.
- The CSS embedded in `index.html` is byte-for-byte unchanged.
- Firebase Realtime Database Rules were not invented or replaced because they are project-specific deployment configuration and must be reviewed against the actual Firebase project.
