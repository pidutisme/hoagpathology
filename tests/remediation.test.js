import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  const app = read('app.js');
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
