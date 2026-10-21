# Deployment / Versioning Audit

## Root cause of repeated Vercel deployments

The repository contained `.github/workflows/auto-version.yml`.

On every push to `main`, that workflow:
1. Read `package.json`.
2. Incremented the version.
3. Modified `package.json` and `package-lock.json`.
4. Committed those changes back to `main`.
5. Pushed the new commit.
6. Created a version tag.

Because Vercel is connected to the Git repository, the original push and the bot-generated version commit were both deployment candidates. This produced the unwanted second deployment.

The workflow's `paths-ignore` prevented a literal infinite loop, but it did **not** prevent the extra deployment on every normal `main` push.

## Fix applied

- Deleted `.github/workflows/auto-version.yml`.
- Kept `package.json` / `package-lock.json` version static and manually controlled.
- Replaced `VERSIONING.md` with the new policy.
- Updated `HARDENING-CHANGES.md` to document the change.
- Kept the Windows installer workflow because it is tag/manual driven and does not push version commits.

## Verification

- `npm test` passes: 3/3 tests.
- No remaining `auto-version.yml` workflow.
- No other workflow in `.github/workflows` writes version changes to `main`.
- `vercel.json` does not contain a build hook, cron, or rewrite that would itself cause repeated deployments.

## Vercel behavior after this fix

A normal push to `main` should result in one Git-triggered production deployment for that commit.

If Vercel still shows repeated deployments after this change, the next places to inspect are Vercel project Git settings / Deploy Hooks / external CI integrations, because the repository no longer contains an automatic version-bump push mechanism.
