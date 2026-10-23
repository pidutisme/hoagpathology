import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const failures = [];

const fail = msg => failures.push(msg);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const appJs = read('assets/js/app.js');
const appCss = read('assets/css/app.css');

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, count] of counts) {
  if (count > 1) fail(`Duplicate HTML id: ${id} (${count} occurrences)`);
}

if (!fs.existsSync(path.join(root, 'assets/css/app.css'))) fail('Missing consolidated CSS asset: assets/css/app.css');
if (!fs.existsSync(path.join(root, 'assets/js/app.js'))) fail('Missing consolidated JS asset: assets/js/app.js');
if (!html.includes('href="/assets/css/app.css"')) fail('index.html does not reference assets/css/app.css.');
if (!html.includes('src="/assets/js/app.js"')) fail('index.html does not reference assets/js/app.js.');
if (/<style\b/i.test(html)) fail('index.html still contains inline <style> blocks.');
const inlineScriptCount = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m => !/\bsrc\s*=/.test(m[1]) && m[2].trim()).length;
if (inlineScriptCount) fail(`index.html still contains ${inlineScriptCount} inline executable <script> block(s).`);

const main = read('desktop/main.cjs');
if (/return ['"]https:\/\/YOUR-VERCEL-DOMAIN/.test(main)) {
  fail('Desktop launcher still contains a placeholder fallback production domain.');
}
const config = JSON.parse(read('desktop/config.json'));
if (!/^https:\/\//.test(String(config.productionUrl || ''))) {
  fail('desktop/config.json must contain an HTTPS productionUrl.');
}

const vercel = JSON.parse(read('vercel.json'));
const headerNames = new Set((vercel.headers || []).flatMap(h => (h.headers || []).map(x => x.key)));
for (const required of ['X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Permissions-Policy']) {
  if (!headerNames.has(required)) fail(`Missing Vercel security header: ${required}`);
}

const frontend = html + '\n' + appJs;
if (!frontend.includes("authAction === 'login' ? '/api/login'")) {
  fail('Frontend login is not routed to /api/login.');
}
if (!frontend.includes("authAction === 'loginState' ? '/api/login-state'")) {
  fail('Frontend session checks are not routed to /api/login-state.');
}

const tokenLocalStorage = [...frontend.matchAll(/localStorage\.setItem\(([^\n]+)\)/g)]
  .some(m => /token|session/i.test(m[1]));
if (tokenLocalStorage) fail('Authentication token appears to be stored in localStorage.');

if (appCss.includes('@import url("https://fonts.googleapis.com')) {
  fail('Google Fonts must be loaded via <link>, not CSS @import.');
}
if (appJs.includes('YOUR-VERCEL-DOMAIN')) fail('Placeholder production domain found in frontend JS.');

console.log(`Hoag Pathology audit v${pkg.version}`);
console.log(`HTML IDs: ${ids.length} total / ${counts.size} unique`);
console.log(`Inline CSS blocks: ${[...html.matchAll(/<style\b/gi)].length}`);
console.log(`Inline JS blocks: ${inlineScriptCount}`);
console.log(`Consolidated assets: CSS ${appCss.length} chars / JS ${appJs.length} chars`);
console.log(`Security headers: ${headerNames.size}`);

if (failures.length) {
  console.error('\nFAILURES');
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log('Audit passed.');
