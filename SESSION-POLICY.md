# HOAG Pathology Session Policy

## Intended behavior

- Login is required when the browser tab/window, Android WebView app instance, or Windows desktop app session is newly opened.
- A normal page refresh/reload keeps the login session.
- Closing the tab/window/app and opening it again requires login.
- There is no **Continue Session** button.
- The authenticated user marker is stored in `sessionStorage` only; `localStorage` is explicitly removed for auth state.
- The server credential remains in an HttpOnly cookie. A newly opened page/app session explicitly invalidates any older cookie before checking login state; a normal refresh keeps the `sessionStorage` marker and therefore keeps the login.

## Why

A persistent HttpOnly cookie can silently restore authentication after the app/browser is closed. That conflicts with the required security behavior. The client session token is therefore intentionally scoped to the page session.

## Test matrix

1. Login -> dashboard: PASS expected.
2. F5 / Ctrl+R: session remains.
3. Close browser tab -> reopen URL: login required.
4. Close Android WebView app -> reopen: login required (subject to the WebView host retaining the same page instance; a fresh WebView session clears `sessionStorage`).
5. Close Windows app -> reopen: login required.
6. Existing legacy `localStorage` auth tokens are removed at startup.
7. Persistent `labapp_session` cookies from older builds are ignored by auth-state validation.
