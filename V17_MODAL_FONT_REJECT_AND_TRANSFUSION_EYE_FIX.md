# V17 — Modal typography, reject dropdown, Transfusion Eye fix

- Modal typography now matches the compact table typography (10px body, 9px labels).
- Outsource Reject Reason uses a native select in the detail modal so it becomes available when Status is REJECTED; it remains disabled for other statuses.
- Transfusion Eye action has document-level delegated handling as a fallback, resolves the record from the live records/cache list, and mounts the modal inside the active module grid.
- Existing API save paths and authorization checks are retained.

Validation: `node --check` passed for frontend and API JavaScript; `npm run build` passed. No live Supabase/production browser test was run.
