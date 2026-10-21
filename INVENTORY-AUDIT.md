# Inventory-only audit / fix

Changed files:
- `index.html`
- `api/bridge.js`

Root cause fixed:
1. Earlier V4-V11 client migrations used multiple local/cloud markers and could reintroduce stale Novaclone data.
2. `mergeCloudAuthoritative()` could merge stale local Novaclone transactions back after a server cleanup.
3. The server V10 logic skipped cleanup when old Novaclone transactions existed, leaving the old opening balance of 2.

Fix:
- Added a single server-side V12 baseline migration in `api/bridge.js`.
- On the first V12 read, the four Novaclone masters are reset to `openingStock = 0` and their pre-existing movements are removed, then the cleaned inventory is persisted to Firebase.
- The V12 marker prevents future Stock In/Out movements from being wiped.
- During the V12 migration response only, stale local Novaclone transactions are not merged back into the clean cloud state.
- Future Novaclone Stock In/Out movements are preserved normally.
- No login, session, dashboard, roster, chat, settings, desktop, Vercel, or other modules were changed.

Validation:
- `api/bridge.js`: Node syntax check PASS
- `index.html`: all inline JavaScript blocks syntax check PASS
