import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('roster and shared inventory use atomic Firebase transactions with conflict responses', () => {
  const bridge = read('api/bridge.js');
  const roster = bridge.slice(bridge.indexOf("case 'saveUserRoster'"), bridge.indexOf("case 'getSharedInventory'"));
  const inventory = bridge.slice(bridge.indexOf("case 'saveSharedInventory'"), bridge.indexOf("case 'clearUserRoster'"));
  assert.match(roster, /atomicVersionedTransaction\(ref/);
  assert.match(roster, /!result\.committed/);
  assert.match(inventory, /atomicVersionedTransaction\(ref/);
  assert.match(inventory, /!result\.committed/);
});

test('admin inventory upsert and delete compare and write atomically', () => {
  const bridge = read('api/bridge.js');
  const adminInventory = bridge.slice(bridge.indexOf("case 'adminInventoryUpsertItem'"), bridge.indexOf("case 'changeAuthPassword'"));
  assert.equal((adminInventory.match(/atomicVersionedTransaction\(ref/g) || []).length, 2);
  assert.equal((adminInventory.match(/!result\.committed/g) || []).length, 2);
});

test('dedicated and legacy bridge login share one password verifier and hide raw token', () => {
  const bridge = read('api/bridge.js');
  const login = read('api/login.js');
  assert.match(login, /export async function loginWithPassword/);
  assert.match(login, /loginFailures\/\$\{userKey\}/);
  assert.match(login, /loginFailures\/\$\{ipKey\}/);
  assert.match(login, /ref\.transaction\(current =>/);
  assert.match(bridge, /loginWithPassword\(db,credentials/);
  assert.match(bridge, /if \(result && result\.token\) delete result\.token/);
  assert.doesNotMatch(login, /buildPasswordRecord|isLegacyPassword/);
});

test('Blob endpoint uses declared package and canonical session validation', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const blob = read('api/transfusion-blob-url.js');
  assert.ok(pkg.dependencies['@vercel/blob']);
  assert.ok(lock.packages['node_modules/@vercel/blob']);
  assert.ok(blob.includes("import { sessionFor } from '../lib/session.js'"));
  assert.match(blob, /sessionFor\(firebaseDb\(\), sessionToken\)/);
});

test('concurrent writes with the same expected revision cannot silently overwrite', async () => {
  const { atomicVersionedTransaction } = await import('../lib/versioned-transaction.js');
  let value = { updatedAt: 'revision-1', data: { roster: ['original'] } };
  let queue = Promise.resolve();
  const ref = {
    transaction(update) {
      const operation = queue.then(() => {
        const next = update(structuredClone(value));
        if (next === undefined) return { committed: false, snapshot: { val: () => structuredClone(value) } };
        value = structuredClone(next);
        return { committed: true, snapshot: { val: () => structuredClone(value) } };
      });
      queue = operation.then(() => undefined, () => undefined);
      return operation;
    }
  };
  const write = data => atomicVersionedTransaction(ref, 'revision-1', current => ({ ...current, updatedAt: data.revision, data }));
  const outcomes = await Promise.all([write({ revision: 'revision-2a', roster: ['A'] }), write({ revision: 'revision-2b', roster: ['B'] })]);
  assert.equal(outcomes.filter(x => x.committed).length, 1);
  assert.equal(outcomes.filter(x => !x.committed).length, 1);
  assert.ok(['revision-2a', 'revision-2b'].includes(value.updatedAt));
  assert.notDeepEqual(value.data.roster, ['original']);
});

test('audit root path is converted from file URL portably', () => {
  const audit = read('scripts/audit.mjs');
  assert.match(audit, /fileURLToPath\(import\.meta\.url\)/);
  assert.doesNotMatch(audit, /new URL\('\.\.', import\.meta\.url\)\.pathname/);
});
