# Versioning Policy

Automatic version bumping is disabled.

- `package.json` and `package-lock.json` keep a manually controlled application version.
- GitHub Actions must not modify, commit, tag, or push version changes on normal `main` pushes.
- Vercel therefore receives exactly the commit pushed to `main` and does not get a second bot commit just to change the version.
- Windows installer releases remain manual/tag-driven through `windows-installer.yml`.

## Current application version

The current static application version is defined in `package.json`.
