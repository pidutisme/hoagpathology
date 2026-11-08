import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('bridge limits request size and validates action envelopes', () => {
  const bridge = read('api/bridge.js');
  assert.match(bridge, /Buffer\.byteLength\(JSON\.stringify\(body\),'utf8'\)>1024\*1024/);
  assert.match(bridge, /payload\.args\.length>20/);
  assert.match(bridge, /Unsupported request field/);
  assert.match(bridge, /ref\.transaction\(current =>/);
  assert.match(bridge, /extra: \{\}/);
});

test('deployment audit requires HSTS alongside baseline headers', () => {
  const audit = read('scripts/audit.mjs');
  const vercel = JSON.parse(read('vercel.json'));
  assert.match(audit, /Strict-Transport-Security/);
  assert.ok(vercel.headers[0].headers.some(h => h.key === 'Strict-Transport-Security'));
});
