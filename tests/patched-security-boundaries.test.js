import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('Notes feature is removed from the application and Firebase rules deny direct client access', () => {
  const app = read('app.js');
  const rules = JSON.parse(read('database.rules.json'));
  assert.doesNotMatch(app, /\bNotes\s*\./);
  assert.doesNotMatch(app, /\bNotes\s*:/);
  assert.equal(rules.rules['.read'], false);
  assert.equal(rules.rules['.write'], false);
  assert.equal(rules.rules.labapp.notes, undefined);
});

test('non-admin inventory writes are operation-limited and schema-validated', () => {
  const bridge = read('api/bridge.js');
  const inventorySchema = read('lib/schemas/inventory.js');
  assert.match(bridge, /Existing inventory movements are immutable for non-admin users/);
  assert.match(bridge, /inventoryMovementSchema\.array\(\)\.max\(1000\)/);
  assert.match(inventorySchema, /export const inventoryMovementSchema = movementSchema/);
});

test('Transfusion legacy compatibility is read-only and does not auto-assign ownership', () => {
  const api = read('api/transfusion.js');
  const access = read('lib/transfusion-access.js');
  const ensure = api.slice(api.indexOf('async function ensureIndependentRecords'), api.indexOf('async function authorizedSession'));
  assert.match(ensure, /READ-ONLY legacy compatibility/);
  assert.doesNotMatch(ensure, /\.update\(/);
  assert.match(access, /canReadLegacyTransfusionRecord/);
  assert.match(access, /canWriteLegacyTransfusionRecord/);
});

test('desktop navigation is origin-allowlisted and permissions are denied by default', () => {
  const desktop = read('desktop/main.cjs');
  assert.match(desktop, /allowedOrigin/);
  assert.match(desktop, /will-navigate/);
  assert.match(desktop, /will-redirect/);
  assert.match(desktop, /setPermissionRequestHandler/);
  assert.match(desktop, /nodeIntegration: false/);
  assert.match(desktop, /sandbox: true/);
});

test('deployment hardening and supported Electron line are present', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const vercel = JSON.parse(read('vercel.json'));
  const html = read('index.html');
  assert.equal(pkg.devDependencies.electron, '45.1.0');
  assert.equal(lock.packages[''].devDependencies.electron, '45.1.0');
  assert.equal(lock.packages['node_modules/electron'].version, '45.1.0');
  assert.ok(vercel.crons.some(x => x.path === '/api/cron/backup'));
  assert.doesNotMatch(html, /<script>\s*\(function\(\)/);
});

test('root and authoritative browser bundles remain byte-identical', () => {
  assert.equal(read('app.js'), read('assets/js/app.js'));
});
