# Hoag Pathology

Hoag Pathology is a Vercel/Firebase web application with an optional Windows desktop launcher.

## Frontend structure

The large legacy `index.html` has been split into cacheable assets:

- `index.html` — document structure and application shell
- `assets/css/app.css` — consolidated frontend stylesheet
- `assets/js/app.js` — consolidated frontend runtime
- Firebase compatibility libraries are loaded before `app.js`

The CSS and JavaScript content was extracted in original cascade/execution order to minimize behavioral changes while removing the previous 30 inline style blocks and 12 inline application-script blocks.

## Deployment

Deploy the repository root to Vercel. Configure these environment variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`

Run the local regression checks with:

```bash
npm test
npm run audit
```

## Windows desktop build

The Electron launcher is under `desktop/`. Installer artifacts are generated into `dist-desktop/`.

## Security

Authentication remains session-scoped. Review Firebase Realtime Database rules and Vercel environment variables before production deployment.


## Security hardening
See `SECURITY-HARDENING-1-5.md`. Deploy `database.rules.json` with Firebase CLI before production use.
