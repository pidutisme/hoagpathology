import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const failures = [];

const fail = msg => failures.push(msg);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of ['api/bridge.js','api/login.js','api/login-state.js','api/dashboard.js','api/health.js','lib/auth.js']) {
  // Runtime imports are intentionally skipped here because Firebase Admin requires deployment-only modules/config.
}

const html = read('index.html');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, count] of counts) if (count > 1) fail(`Duplicate HTML id: ${id} (${count} occurrences)`);

const main = read('desktop/main.cjs');
if (/return ['\"]https:\/\/YOUR-VERCEL-DOMAIN/.test(main)) fail('Desktop launcher still contains a placeholder fallback production domain.');
const config = JSON.parse(read('desktop/config.json'));
if (!/^https:\/\//.test(String(config.productionUrl || ''))) fail('desktop/config.json must contain an HTTPS productionUrl.');

const vercel = JSON.parse(read('vercel.json'));
const headerNames = new Set((vercel.headers || []).flatMap(h => (h.headers || []).map(x => x.key)));
for (const required of ['X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Permissions-Policy']) {
  if (!headerNames.has(required)) fail(`Missing Vercel security header: ${required}`);
}

if (!html.includes("authAction === 'login' ? '/api/login'")) fail('Frontend login is not routed to /api/login.');
if (!html.includes("authAction === 'loginState' ? '/api/login-state'")) fail('Frontend session checks are not routed to /api/login-state.');
if (html.includes('localStorage.setItem') && /session|token/i.test(html)) {
  const tokenLocalStorage = [...html.matchAll(/localStorage\.setItem\(([^\n]+)\)/g)].some(m => /token|session/i.test(m[1]));
  if (tokenLocalStorage) fail('Authentication token appears to be stored in localStorage.');
}

console.log(`Hoag Pathology audit v${pkg.version}`);
console.log(`HTML IDs: ${ids.length} total / ${counts.size} unique`);
console.log(`Security headers: ${headerNames.size}`);
if (failures.length) {
  console.error('\nFAILURES');
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log('Audit passed.');
