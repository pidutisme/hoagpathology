# V7 – Concurrent roster save

## Required deployment order
1. In Supabase Dashboard, open SQL Editor.
2. Run `2026-11-03_atomic_roster_merge.sql` once.
3. Deploy the application ZIP.
4. Hard refresh all open browsers (Ctrl+Shift+R).

## What changed
- Browser now sends the exact dirty date keys with each roster save.
- Backend calls `merge_team_roster_dates` rather than doing a read-then-upsert.
- The Postgres function locks the shared `app_roster` row and merges only the dates changed by that client.
- Edits to different dates made concurrently are preserved.
- Backend intentionally fails with an actionable error if the SQL function has not been installed; it does not silently fall back to the unsafe whole-roster upsert.

## Same-date concurrent edits
This version serializes saves at the database row and date-key level. If two users edit the same date, the later committed save wins for that date. A true same-date conflict-resolution workflow requires comparing the per-date baseline and prompting the users; this is not silently claimed as solved here.

## Validation
Syntax checks are required after extraction. Live multi-user verification requires the target Supabase project and two authenticated browser sessions.
