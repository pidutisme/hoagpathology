# HOAG Pathology

**HOAG Pathology Laboratory Operations System** — a web-based single-page application (SPA) for pathology laboratory operations, authentication, team roster management, notes, live chat, administration, maintenance/broadcast controls, and related operational workflows.

The application is designed to run across:

- 🌐 **Web / Vercel**
- 📱 **Mobile / Android WebView / PWA**
- 🖥️ **Windows desktop via Electron**

> **Current UI direction:** Premium Neumorphism. The Neumorphism visual identity is intentionally retained while the interface is progressively polished for usability, responsiveness, accessibility, and performance.

---

## ✨ Highlights

### Application

- Secure username/password login flow
- Server-side session validation
- Role-based access with `ADMIN` support
- Automatic session expiry handling
- Logout and session revocation support
- Dashboard and server status information
- Shared team roster with conflict detection
- Notes with Firebase-backed persistence and per-user read state
- Global live chat
- Direct/private chat support
- Chat lock controlled by administrators
- Reactions and chat-related operational controls
- System broadcast / announcement support
- Maintenance mode support
- Malaysia holiday data integration
- Administrative user management and operational controls
- Activity/audit logging

### UI / UX

- Premium Neumorphism visual system
- Responsive desktop, tablet, and mobile layouts
- Touch-friendly controls for WebView/mobile use
- Keyboard-friendly interaction and visible focus states
- Responsive navigation and mobile adaptations
- Loading, empty, success, warning, and error states
- Reduced-motion support
- Dark/light color-scheme awareness
- Mobile safe-area support
- Improved form and validation feedback
- PWA installability

### Platform support

| Platform | Support |
|---|---|
| Chrome / Edge / modern browsers | ✅ |
| Vercel production hosting | ✅ |
| Android WebView | ✅ |
| PWA / standalone mode | ✅ |
| Windows desktop | ✅ Electron |

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │     Web Browser     │
                         │   / PWA / WebView   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     index.html      │
                         │     SPA frontend    │
                         └──────────┬──────────┘
                                    │
                         POST /api/bridge
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Vercel Functions  │
                         │     /api/*.js       │
                         └──────────┬──────────┘
                                    │
                          Firebase Admin SDK
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Firebase Realtime  │
                         │       Database      │
                         └─────────────────────┘

Windows:

┌───────────────────┐
│ Electron Desktop  │
│ desktop/main.cjs  │
└─────────┬─────────┘
          │ loads production Vercel URL
          ▼
       Web App
```

The browser frontend communicates with the Vercel backend through `/api/bridge`. Authentication/session-sensitive operations are handled server-side using Firebase Admin SDK.

---

## 📁 Project Structure

```text
.
├── index.html                 # Main SPA frontend
├── ui-polish.css              # UI/UX enhancement layer
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker / update handling
├── package.json               # Node/Electron/Vercel project configuration
├── package-lock.json
├── VERSIONING.md              # Automatic production versioning notes
├── MIGRATION-README.md        # Vercel/Firebase migration notes
│
├── api/
│   ├── bridge.js              # Main authenticated application API dispatcher
│   ├── dashboard.js           # Dashboard endpoint
│   ├── health.js              # Health/status endpoint
│   ├── login.js               # Login endpoint
│   ├── login-state.js         # Session state validation
│   └── [...path].js            # Legacy/compatibility proxy file
│
├── lib/
│   ├── auth.js                # Authentication helpers
│   └── firebase-admin.js      # Firebase Admin initialization
│
├── desktop/
│   ├── main.cjs              # Electron Windows entry point
│   ├── config.json           # Production URL configuration
│   └── icon.ico              # Windows application icon
│
├── .github/workflows/
│   ├── auto-version.yml       # Automatic version bump/tag workflow
│   └── windows-installer.yml  # Windows installer build/release workflow
│
└── icons / screenshots / PWA assets
```

---

## 🚀 Web Deployment — Vercel

The application is intended to be deployed from GitHub to Vercel.

### Requirements

- Node.js `22.x`
- Firebase project with Realtime Database
- Vercel project connected to this GitHub repository
- Required Firebase environment variables

### Vercel environment variables

Set these in the Vercel project:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_DATABASE_URL
```

For `FIREBASE_PRIVATE_KEY`, preserve newline characters using `\n` when entering the value in the Vercel dashboard.

No legacy Apps Script URL is required by the current Vercel/Firebase application flow.

### Deploy

A normal push to the configured production branch will trigger the Vercel deployment through the connected Git integration.

Typical workflow:

```bash
git add .
git commit -m "feat: improve pathology dashboard"
git push origin main
```

Then verify the Vercel deployment and application login/API behavior.

---

## 🔐 Authentication & Firebase

The application uses Firebase Realtime Database for application data and Firebase Admin SDK on the server side.

The login flow is approximately:

```text
User credentials
      ↓
POST /api/bridge
      ↓
Firebase user/session validation
      ↓
Secure application session
      ↓
Authenticated application
```

Firebase client services are also used where required by application features such as notes/chat synchronization.

### Important

Do **not** commit Firebase Admin private credentials, service-account JSON files, or other secrets to GitHub.

Use Vercel Environment Variables for production secrets.

---

## 👤 Roles

The application supports role-aware access. The backend currently recognizes administrator access through the `ADMIN` role.

Examples of administrator-controlled functionality include:

- User management
- Maintenance mode
- Broadcast messages
- Chat lock
- Shared roster clearing
- Administrative operational actions
- Activity/audit logging

Regular users are restricted from administrator-only operations by server-side session checks.

---

## 💬 Live Chat

The application supports:

- Global chat
- Direct/private conversations
- User-aware participant lists
- Message persistence
- Chat locking by administrator
- Role-aware chat visibility

Chat data is handled through the authenticated API/Firebase data layer rather than exposing administrative credentials to the browser.

---

## 📝 Notes

Notes are stored through Firebase-backed application data and include user-specific state such as read/open information.

The application also contains compatibility/hydration logic for existing notes data so existing operational data can be retained during migration.

---

## 📅 Malaysia Holiday Integration

The application can retrieve Malaysia holiday data for calendar/roster-related workflows through the configured holiday API integration.

The current backend uses:

```text
https://malaysia-holiday.dydxsoft.my/api/v1/holidays
```

The frontend also caches holiday results locally where appropriate to reduce unnecessary requests.

---

## 📱 PWA / Android WebView

`manifest.json` and `sw.js` provide the foundation for standalone/PWA usage.

The frontend includes mobile-specific handling such as:

- `viewport-fit=cover`
- Mobile-safe spacing
- Touch-friendly controls
- Responsive layouts
- Service-worker registration
- Application update detection
- Local storage for selected client-side state

For Android WebView, the web application can be loaded as the primary application surface without requiring a separate mobile frontend.

---

## 🖥️ Windows Desktop App

The Windows application uses Electron as a thin desktop client.

The Electron client loads the production Vercel URL instead of bundling the complete web application locally.

This means normal frontend/backend changes deployed to Vercel are immediately available to the installed desktop application on its next launch.

### Build locally

Install dependencies:

```bash
npm ci
```

Build the Windows installer:

```bash
npm run desktop:dist
```

The installer output is generated in:

```text
dist-desktop/
```

### Production URL

Before packaging the Windows application, configure:

```text
desktop/config.json
```

with the actual Vercel production URL instead of the placeholder:

```text
YOUR-VERCEL-DOMAIN
```

---

## 🤖 GitHub Actions

### Automatic versioning

`.github/workflows/auto-version.yml` automatically updates the application version after pushes to `main`.

The workflow can perform:

- patch version bump
- minor version bump for `feat:` commits
- major version bump for breaking changes
- package-lock synchronization
- automatic commit
- version tag creation

Example:

```text
2.1.20 → 2.1.21
```

### Windows installer

`.github/workflows/windows-installer.yml` builds the Windows installer when a `v*` tag is pushed or when manually triggered.

The resulting installer is uploaded to a GitHub Release.

---

## 🧪 Recommended Production Test Checklist

Before switching a new build to production, test:

- [ ] Login
- [ ] Invalid login handling
- [ ] Session persistence
- [ ] Session expiry
- [ ] Logout
- [ ] Password change
- [ ] Dashboard
- [ ] Holiday calendar
- [ ] Team roster load
- [ ] Team roster save
- [ ] Roster conflict handling
- [ ] Global chat
- [ ] Direct chat
- [ ] Chat lock
- [ ] Reactions
- [ ] Notes CRUD
- [ ] Notes read/open state
- [ ] Admin user management
- [ ] Maintenance mode
- [ ] Broadcast messages
- [ ] Activity/audit logging
- [ ] Mobile layout
- [ ] Android WebView
- [ ] PWA install
- [ ] Windows Electron client
- [ ] Vercel function logs
- [ ] Firebase data paths

---

## ⚠️ Migration / Production Notes

This repository contains a Vercel/Firebase migration architecture. Before removing any legacy infrastructure, verify application parity and existing Firebase data.

The migration documentation in [`MIGRATION-README.md`](./MIGRATION-README.md) contains additional validation notes and required environment variables.

Do not delete or alter existing Firebase data paths without taking a backup and validating the application behavior first.

---

## 🎨 UI / UX Direction

The project intentionally retains its **Neumorphism** visual identity.

The current UI improvement direction focuses on:

- Cleaner spacing
- Better hierarchy
- More consistent components
- Responsive layouts
- Better keyboard accessibility
- Better mobile touch interaction
- Improved loading/error states
- Subtle micro-interactions
- Dark/light theme compatibility
- Performance-conscious styling

The goal is **Premium Neumorphism**, rather than replacing the application's existing visual identity with a completely different design system.

---

## 📌 Version

Current repository version:

```text
2.1.20
```

The production version is intended to be managed automatically through the GitHub Actions versioning workflow.

---

## 📄 License / Internal Use

This repository is configured as a private application project (`private: true` in `package.json`). Unless a separate license is added by the project owner, treat the source code and application assets as proprietary/internal software.

---

## 👨‍💻 Maintainer

**HOAG Pathology**

Laboratory Operations System
