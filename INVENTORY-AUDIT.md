# Inventory-only audit / fix

## Root cause of the Novaclone balance returning to 2

The Novaclone rows were showing `BALANCE = 2` while `TOTAL IN = 0` and `TOTAL OUT = 0`. That means the 2 was coming from `openingStock`, not from a stock movement.

The code had accumulated several one-time V4-V12 migrations. The important failure was that V12 trusted the flag `novacloneBalanceResetV12 === true`. Once that marker existed, the server stopped correcting the record. A later client save could therefore write an old/stale `openingStock = 2` back into Firebase, and the migration would not run again.

There was also a client-side October 2026 opening-balance repair which could restore the seed opening quantity after earlier Novaclone cleanup logic. The Novaclone seed itself is intended to start at zero, but stale shared data could still win during synchronization.

## Fix applied

Changed files:
- `index.html`
- `api/bridge.js`
- `INVENTORY-AUDIT.md`

### `api/bridge.js`
- Added a **server-side Novaclone baseline guard on every inventory read**: all four Novaclone masters are forced to `openingStock = 0`.
- Added the same guard on **every inventory write**, so an old browser cannot write `openingStock = 2` back to Firebase.
- Legitimate Stock In / Stock Out transactions are preserved; only the baseline field is forced to zero.
- The old V12 migration marker is retained for compatibility, but it is no longer trusted as proof that the actual data is clean.

### `index.html`
- The October 2026 opening-balance repair now explicitly excludes the four Novaclone masters from inherited opening stock.
- Novaclone balance therefore remains zero until an actual Stock In transaction is recorded.

## Expected result after deployment

For all four Novaclone rows:
- `TOTAL IN = 0`
- `TOTAL OUT = 0`
- `BALANCE = 0`
- `VALUE = RM0.00`
- `STATUS = OUT`

After a real Stock In, the balance increases normally. Stock Out then decreases it normally. The fix does **not** wipe future legitimate movements.

## Validation

- `api/bridge.js`: Node syntax check PASS
- `npm test`: 3/3 PASS
- `index.html`: change is limited to the October opening-balance repair guard; existing inventory UI remains unchanged.
