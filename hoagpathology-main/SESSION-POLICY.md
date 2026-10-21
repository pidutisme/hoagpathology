# Session Policy

- Login, refresh/session validation, and logout use the single `/api/bridge` authentication implementation.
- The client keeps the auth token only in `sessionStorage`.
- `localStorage` is never used for authentication and legacy auth keys are removed on startup.
- The server does not restore authentication from the legacy `labapp_session` cookie.
- Normal page refresh/reload keeps the current tab/WebView session.
- Closing the browser tab/window or destroying the WebView/Electron page session requires a new login.
- No "Continue Session" action is exposed in the login UI.
