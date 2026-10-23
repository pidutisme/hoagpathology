# Hoag Pathology — Audit & Fix Report

## Fixed in this package

1. **Desktop launcher fallback hardening**
   - Removed the invalid `YOUR-VERCEL-DOMAIN` fallback URL.
   - If `desktop/config.json` is missing/invalid, the Windows app now shows a clear error and exits instead of attempting to open a fake URL.

2. **API version drift**
   - `/api/login` and `/api/login-state` no longer hard-code `2.1.81`.
   - Both read the version from `package.json`, keeping API responses synchronized with the deployed application.

3. **Frontend source split / cascade cleanup**
   - Moved the 30 inline `<style>` blocks into `assets/css/app.css` without changing cascade order.
   - Moved the 12 inline application scripts into `assets/js/app.js` without changing execution order.
   - Moved Google Fonts from CSS `@import` to a normal stylesheet link.
   - Removed script/style block IDs that were only useful for the old inline layout.

4. **Duplicate HTML IDs**
   - Found 3 duplicate IDs in the large SPA document, caused by style/script blocks sharing the same identifiers.
   - Renamed them so the document now has **227 unique IDs**.

5. **Regression audit command**
   - Added `npm run audit`.
   - Checks HTML ID uniqueness, desktop configuration, required security headers, login/session endpoint routing, and accidental authentication-token storage in `localStorage`.

## Verification completed

- `npm test` → **3/3 passed**.
- Node syntax checks for changed API/desktop files → **passed**.
- Consolidated `assets/js/app.js` → syntax checked successfully.
- `index.html` contains no inline `<style>` or executable `<script>` blocks.
- `npm run audit` → **passed**.
- Vercel security headers → **4 configured**.

## Desktop installer note

The Windows installer build was not executed successfully in this audit environment because `electron-builder` was not installed in the local dependency tree after the dependency installation timed out. The project still declares `electron-builder@26.0.12`, and the existing GitHub Actions workflow installs dependencies with `npm ci` before building the installer.

## Deployment

For Vercel, upload/deploy the project root containing `index.html`, `api/`, `lib/`, `vercel.json`, `package.json`, and `package-lock.json`.

Ensure the required Firebase Admin environment variables/secrets are configured in Vercel before testing login or protected API actions.
