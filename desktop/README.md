# Hoag Pathology Windows installer

The Windows app is a thin Electron client that loads the production Vercel deployment.

## Update behavior

GitHub -> Vercel deploys update the live web app. Installed EXEs do NOT need to be rebuilt or reinstalled for normal web-app changes because the EXE loads the live Vercel URL on every launch.

The installer itself can also be rebuilt automatically by GitHub Actions when needed.

Before packaging, replace `YOUR-VERCEL-DOMAIN` in `desktop/config.json` with the real Vercel production URL.
