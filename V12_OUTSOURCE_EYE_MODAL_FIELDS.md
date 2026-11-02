# V12 – Outsource Eye Modal Result Fields

The Outsource Eye detail modal now contains editable fields for:
- Status (Pending / Completed / Rejected)
- Result Date (the application's calendar date picker)
- Reference No.
- Reject Reason (catalog-backed dropdown)
- Notes

Use **Save Changes** in the Eye modal to persist these fields through the existing `OutSource.upsertSample()` path. Reject Reason is enabled only when Status is Rejected. Existing row Edit and Delete actions remain separate. Transfusion detail modal is unchanged.

Validation performed: `node --check app.js`, `node --check assets/js/app.js`, and `npm run build`.
