import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateBuildId } from '../scripts/build.mjs';

const read = name => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('outsource writes are record-level and deletes are admin-or-owner scoped', () => {
  const bridge = read('api/bridge.js');
  assert.match(bridge, /case 'saveOutsourceSamples'[\s\S]*?fail\('Bulk outsource replacement is disabled/);
  assert.match(bridge, /case 'upsertOutsourceSample'[\s\S]*?ref\.transaction\(/);
  assert.match(bridge, /Administrator access is required to update an outsource record/);
  assert.match(bridge, /case 'deleteOutsourceSample'[\s\S]*?requireSession\(/);
  assert.match(bridge, /requireOutsourceDeletePermission/);
  assert.match(bridge, /outsource\.delete\.own/);
  assert.match(bridge, /createdByUserId/);
  assert.match(bridge, /displayName/);
  assert.doesNotMatch(bridge, /case 'saveOutsourceSamples'[\s\S]*?await ref\.set\(rows\)/);
});


test('outsource legacy inventory is merged once, deduplicated, then removed', () => {
  const bridge = read('api/bridge.js');
  const app = read('assets/js/app.js');
  assert.match(bridge, /hasLegacyField/);
  assert.match(bridge, /legacyInventory\.outsourceSamples/);
  assert.match(bridge, /OUTSOURCE_DELETED/);
  assert.match(bridge, /migrationComplete:true/);
  assert.match(bridge, /coreFingerprint/);
  assert.match(bridge, /delete inv\.outsourceSamples/);
  assert.match(bridge, /delete data\.outsourceSamples/);
  assert.match(bridge, /delete next\.outsourceSamples/);
  assert.doesNotMatch(bridge, /if\(!rows\.length\)\{/);
  assert.match(app, /authoritative OUTSOURCE snapshot/);
  assert.match(app, /rows=Array\.isArray\(result\.outsourceSamples\)/);
});

test('browser storage refuses operational and patient-data caches', () => {
  const app = read('assets/js/app.js');
  assert.match(app, /function isSensitiveBrowserStorageKey/);
  assert.match(app, /labDailyRosterV26/);
  assert.match(app, /labAppInventory/);
  assert.match(app, /safeStorageSet\(key, value\)[\s\S]*?isSensitiveBrowserStorageKey\(key\)/);
});

test('inventory reads do not run data migrations or persist reconstructed history', () => {
  const app = read('assets/js/app.js');
  const bridge = read('api/bridge.js');
  assert.doesNotMatch(app, /function (?:migrateInventoryNames|mergeSeedCatalog|repairDuplicateItemIds|resetInventoryForFreshStart|repairOctober2026OpeningBalance|repairNovacloneBalanceV[5-9])\s*\(/);
  const rollover = app.match(/function ensureInventoryMonthRollover\(force\)\{[\s\S]*?\n      \}/)?.[0] || '';
  assert.doesNotMatch(rollover, /saveRemote|saveMonthlySnapshot/);
  assert.match(bridge, /delete requestedInventory\.outsourceSamples/);
  assert.match(bridge, /delete requestedInventory\.deletedOutsourceSampleIds/);
});

test('password input preserves whitespace and policy enforces minimum length', () => {
  const auth = read('lib/auth.js');
  const bridge = read('api/bridge.js');
  assert.match(auth, /normalizePassword\(value\)\s*\{\s*return String\(value == null \? "" : value\);/);
  assert.match(bridge, /pass\.length<4/);
  assert.match(bridge, /nextPass\.length<4/);
  assert.doesNotMatch(bridge, /pass\.length<12|nextPass\.length<12/);
});

test('build script validates syntax and actual project structure', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.build, 'node scripts/build.mjs');
  assert.ok(fs.existsSync(new URL('../scripts/build.mjs', import.meta.url)));
});

test('normal user notification form controls are re-enabled after visitor read-only mode', () => {
  const app = read('assets/js/app.js');
  const notificationJs = read('assets/js/notification.js');
  const notificationCss = read('assets/css/notification.css');
  assert.match(app, /function applyVisitorReadOnly_\(\)[\s\S]*?el\.disabled = !!wasDisabled/);
  assert.match(app, /window\.LabNotification && typeof window\.LabNotification\.syncInteractiveState === 'function'/);
  assert.match(notificationJs, /function getLiveNotificationAuthUser\(\)/);
  assert.match(notificationJs, /function syncInteractiveState\(\)/);
  assert.match(notificationCss, /#notification \.notification-result-control\.is-quantitative \.notification-custom-select-wrap\s*\{\s*display:\s*none\s*!important;/);
});

test('Visitor-configurable APIs enforce the assigned page before operation permissions', () => {
  const bridge = read('api/bridge.js');
  const transfusion = read('api/transfusion.js');
  const blob = read('api/transfusion-blob-url.js');

  assert.match(bridge, /case 'getSharedInventory':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'INVENTORY', 'inventory\.read'\)/);
  assert.match(bridge, /case 'getSharedInventoryMeta':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'INVENTORY', 'inventory\.read'\)/);
  assert.match(bridge, /case 'getOutsourceSamples':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'OUTSOURCE', 'outsource\.read'\)/);
  assert.match(bridge, /case 'getNotificationRecords':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'notification', 'notification\.read'\)/);
  assert.match(bridge, /case 'getUserRosterEnvelope':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'calendar', 'roster\.read'\)/);
  assert.match(bridge, /case 'getTransfusionRecords':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'TRANSFUSION', \['transfusion\.read\.own', 'transfusion\.read\.all'\]\)/);
  assert.match(bridge, /\.filter\(r => canReadTransfusionRecord\(s, r\) \|\| canReadLegacyTransfusionRecord\(s, r\)\)/);
  assert.match(transfusion, /req\.method==='GET'[\s\S]*?requireModuleAccess\(session, 'TRANSFUSION', \['transfusion\.read\.own', 'transfusion\.read\.all'\]\)/);
  assert.match(blob, /requireModuleAccess\([\s\S]*?'TRANSFUSION',[\s\S]*?operation === 'put'[\s\S]*?'transfusion\.read\.all'/);
});

test('Visitor cards stay visible, fresh login opens Dashboard, and pathology year links stay locked', () => {
  const app = read('assets/js/app.js');

  assert.match(app, /function getDefaultAllowedPage\(\)\s*\{\s*return 'dashboard';/);
  assert.match(app, /if \(options\.freshLogin && typeof window\.LabApp\.Router\.openDashboard === 'function'\)\s*\{\s*window\.LabApp\.Router\.openDashboard\(\);/);
  assert.match(app, /button\.hidden = false;[\s\S]*?card\.hidden = false;/);
  assert.match(app, /if \(!canAccessPage\(pageId\)\)\s*\{\s*denyVisitorPageAccess\(pageId\);\s*return;/);
  assert.match(app, /var visitorYearLocked = isVisitorAccessRestricted\(\);\s*var locked = isFuture \|\| visitorYearLocked;\s*var externalUrl = visitorYearLocked \? '' : getModuleYearExternalLink\(moduleName, year\);/);
  assert.match(app, /if \(locked\) card\.disabled = true;/);
  assert.doesNotMatch(app, /var visitorAccessCatalog\s*=\s*\[\s*\{/);
});

test('changing Visitor page assignment refreshes access without revoking active sessions', () => {
  const bridge = read('api/bridge.js');
  const start = bridge.indexOf("case 'adminSetVisitorPageAccess':");
  const end = bridge.indexOf("case 'adminDeleteAuthUser':", start);
  assert.ok(start >= 0 && end > start);
  const action = bridge.slice(start, end);
  assert.match(action, /saveSettings\(settings\)/);
  assert.match(action, /clearSessionCache\(id\)/);
  assert.doesNotMatch(action, /sessions_revoked_at|app_sessions/);
});

test('system log writes share bounded server-side retention and one authoritative login event', () => {
  const session = read('lib/session.js');
  const login = read('api/login.js');
  const bridge = read('api/bridge.js');

  assert.match(session, /SYSTEM_LOG_RETENTION_DAYS = 14/);
  assert.match(session, /\.lt\('created_at', cutoff\)[\s\S]*?\.limit\(SYSTEM_LOG_RETENTION_BATCH_SIZE\)/);
  assert.match(session, /\.delete\(\)\s*\.in\('id', expiredIds\)/);
  assert.match(session, /await applySystemLogRetention\(\)/);
  assert.match(login, /action: 'LOGIN'/);
  assert.match(bridge, /case 'recordSuccessfulLogin': \{ const s = await requireSession\(db, tokenAt\(0\)\); return \{ ok: true, authenticated: true/);
  assert.match(bridge, /'CLIENT_ACTIVITY'\);/);
});

test('system log retention uses a strict 14-day cutoff and a bounded idempotent batch', async () => {
  const { expiredSystemLogIds } = await import('../lib/session.js');
  const now = Date.UTC(2026, 10, 14, 0, 0, 0);
  const cutoff = now - 14 * 24 * 60 * 60 * 1000;
  const rows = [
    { id: 'at-cutoff', created_at: new Date(cutoff).toISOString() },
    { id: 'newer', created_at: new Date(cutoff + 1).toISOString() },
    { id: 'old-1', created_at: new Date(cutoff - 1).toISOString() },
    ...Array.from({ length: 260 }, (_, index) => ({
      id: `old-${index + 2}`,
      created_at: new Date(cutoff - 1000 - index).toISOString()
    }))
  ];

  const expired = expiredSystemLogIds(rows, now);
  assert.equal(expired.length, 250);
  assert.equal(expired[0], 'old-1');
  assert.equal(expired.includes('at-cutoff'), false);
  assert.equal(expired.includes('newer'), false);
  assert.equal(new Set(expired).size, expired.length);
  assert.deepEqual(expiredSystemLogIds(rows, now), expired);
  assert.throws(() => expiredSystemLogIds(rows, Number.NaN), /valid retention timestamp/);
});

test('application version is served from package metadata without a service-worker duplicate', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const dashboard = read('api/dashboard.js');
  const bridge = read('api/bridge.js');
  const login = read('api/login.js');
  const loginState = read('api/login-state.js');
  const serviceWorker = read('sw.js');
  assert.equal(pkg.name, 'labportal');
  assert.equal(pkg.version, '3.0.1');
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].name, pkg.name);
  assert.equal(lock.packages[''].version, pkg.version);
  for (const source of [dashboard, bridge, login, loginState]) {
    assert.match(source, /require\(["'][^"']*package\.json["']\)\.version/);
  }
  assert.doesNotMatch(serviceWorker, /hoagpathology-v\d+\.\d+\.\d+/i);
});

test('local Build ID is deterministic and changes with deployed content', () => {
  const html = '<meta name="labportal-build-id" content="BUILD_ID_PENDING"/>';
  const sourceA = [
    { path: 'assets/css/app.css', content: 'body{color:#111}' },
    { path: 'assets/js/app.js', content: 'window.ready=true;' },
    { path: 'index.html', content: html }
  ];
  const idA = calculateBuildId(sourceA);
  const idARepeat = calculateBuildId([
    { path: 'index.html', content: html.replace('BUILD_ID_PENDING', idA) },
    sourceA[1], sourceA[0]
  ]);
  const idB = calculateBuildId([
    { ...sourceA[0], content: 'body{color:#222}' }, sourceA[1], sourceA[2]
  ]);
  const buildScript = read('scripts/build.mjs');

  assert.match(idA, /^[A-F0-9]{12}$/);
  assert.equal(idARepeat, idA);
  assert.notEqual(idA, idB);
  assert.doesNotMatch(buildScript, /process\.env\.VERCEL|Date\.now\(|Math\.random\(|fetch\s*\(/i);
});

test('startup verifies the same-tab session before restoring protected pages', () => {
  const app = read('assets/js/app.js');
  const index = read('index.html');
  const login = read('api/login.js');
  const checkStart = app.indexOf('function checkStoredSession()');
  const checkEnd = app.indexOf('function updateResumeSessionButton_()', checkStart);
  const bootstrap = app.slice(checkStart, checkEnd);

  assert.ok(checkStart >= 0 && checkEnd > checkStart);
  assert.match(index, /<body class="auth-locked auth-resolving" data-auth-status="AUTH_RESOLVING">/);
  assert.match(index, /<div aria-hidden="true" class="app">/);
  assert.match(app, /var AUTH_RESOLVING = 'AUTH_RESOLVING'/);
  assert.match(app, /hasTabAuthenticated_\(\) && getNavigationType_\(\) === 'reload'/);
  assert.match(bootstrap, /hoagApiRequest\('loginState', \{ freshSession: !tabAuthenticated \}\)/);
  assert.match(bootstrap, /unlock\(restoredUser, \{ freshLogin: false, restoredSession: true \}\)/);
  assert.doesNotMatch(bootstrap, /cachedRestoreUser|restoredSessionFallbackTimer|setTimeout/);
  assert.doesNotMatch(login, /Max-Age=\$\{SESSION_SECONDS\}/);
});

test('System Check performs protected read-only backend and Blob checks', () => {
  const bridge = read('api/bridge.js');
  const app = read('assets/js/app.js');
  const start = bridge.indexOf('async function runSystemHealthCheck');
  const end = bridge.indexOf('export default async function handler', start);
  const check = bridge.slice(start, end);
  const uiStart = app.indexOf('ORIGINAL SCRIPT BLOCK: settings-system-check-runtime');
  const uiEnd = app.indexOf('ORIGINAL SCRIPT BLOCK: inventory-scroll-runtime-fix', uiStart);
  const ui = app.slice(uiStart, uiEnd);

  assert.ok(start >= 0 && end > start);
  assert.match(bridge, /case 'runSystemCheck': return runSystemHealthCheck\(db, tokenAt\(0\)\)/);
  assert.match(check, /await requireAdmin\(db, token\)/);
  assert.match(check, /from\('app_settings'\)\.select\('id'\)\.limit\(1\)/);
  assert.match(check, /await list\(\{ prefix: 'transfusion\/', limit: 1 \}\)/);
  assert.match(check, /checks\.some\(check => check\.status === 'FAIL'\)/);
  assert.doesNotMatch(check, /\.insert\(|\.update\(|\.delete\(|put\(/);
  assert.match(ui, /auth\.runSystemCheck\(\)/);
  assert.doesNotMatch(ui, /localStorage\.setItem|navigator\.onLine|setTimeout\(/);
});

test('LabPortal metadata is local, consistent, and has no Last Updated field', () => {
  const index = read('index.html');
  const manifest = JSON.parse(read('manifest.json'));
  const pkg = JSON.parse(read('package.json'));
  const app = read('assets/js/app.js');

  assert.match(index, /<title>LabPortal - Laboratory Management System<\/title>/);
  assert.match(index, /<strong>App Name<\/strong><span>LabPortal - Laboratory Management System<\/span>/);
  assert.match(index, /<strong>App Type<\/strong><span>Single Page Application<\/span>/);
  assert.match(index, /<meta name="labportal-release-version" content="3\.0\.1"\/>/);
  assert.match(index, /<meta name="labportal-build-id" content="(?:BUILD_ID_PENDING|[A-F0-9]{12})"\/>/);
  assert.doesNotMatch(index, /Last Updated/i);
  assert.equal(manifest.name, 'LabPortal - Laboratory Management System');
  assert.equal(pkg.build.productName, 'LabPortal - Laboratory Management System');
  assert.match(app, /function renderApplicationMetadata\(\)/);
  assert.match(app, /meta\[name="labportal-release-version"\]/);
});
