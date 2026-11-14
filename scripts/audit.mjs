import fs from 'node:fs';
import path from 'node:path';
import { builtinModules, createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const failures = [];
const fail = message => failures.push(message);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const ignoredDirectories = new Set(['node_modules', '.git', 'dist', 'dist-desktop']);

function listFiles(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, result);
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function parseJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`Malformed JSON in ${file}: ${error.message}`);
    return {};
  }
}

function checkAssetReference(reference, fromFile, label) {
  const raw = String(reference || '').trim();
  if (!raw || /^(?:https?:|data:|blob:|mailto:|tel:|sms:|javascript:|#)/i.test(raw)) return;
  let pathname;
  try {
    pathname = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
  } catch {
    fail(`Invalid encoded asset reference in ${label}: ${raw}`);
    return;
  }
  if (!pathname || pathname === '/') pathname = 'index.html';
  const target = path.resolve(root, pathname.startsWith('/') ? pathname.slice(1) : path.join(path.dirname(fromFile), pathname));
  if (target !== root && !target.startsWith(root + path.sep)) {
    fail(`Asset reference escapes project root in ${label}: ${raw}`);
    return;
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    fail(`Missing local asset referenced by ${label}: ${raw}`);
  }
}

function checkCssStructure(css, file) {
  const stack = [];
  let quote = '';
  let comment = false;
  let escaped = false;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    const next = css[index + 1];
    if (comment) {
      if (char === '*' && next === '/') { comment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && next === '*') { comment = true; index += 1; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '{' || char === '(' || char === '[') { stack.push({ char, index }); continue; }
    if (char === '}' || char === ')' || char === ']') {
      const expected = char === '}' ? '{' : char === ')' ? '(' : '[';
      const previous = stack.pop();
      if (!previous || previous.char !== expected) {
        fail(`Unbalanced CSS delimiter in ${file} near character ${index}.`);
        return;
      }
    }
  }
  if (comment) fail(`Unclosed CSS comment in ${file}.`);
  if (quote) fail(`Unclosed CSS string in ${file}.`);
  if (stack.length) fail(`Unclosed CSS delimiter in ${file}: ${stack[stack.length - 1].char}.`);
}

const files = listFiles(root);
const relativeFiles = files.map(file => path.relative(root, file).replaceAll(path.sep, '/'));
for (const file of files.filter(file => /\.json$/i.test(file))) {
  try { JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`Malformed JSON in ${path.relative(root, file)}: ${error.message}`); }
}

const html = read('index.html');
const appJs = read('assets/js/app.js');
const cssFiles = files.filter(file => /\.css$/i.test(file));
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const counts = new Map();
for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, count] of counts) if (count > 1) fail(`Duplicate HTML id: ${id} (${count} occurrences)`);

const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const stack = [];
for (const match of htmlWithoutComments.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)) {
  const whole = match[0];
  const name = match[1].toLowerCase();
  if (/^<\//.test(whole)) {
    const open = stack.pop();
    if (open !== name) fail(`Mismatched HTML closing tag: </${name}>${open ? ` closes <${open}>` : ' has no open tag'}.`);
  } else if (!voidTags.has(name) && !/\/\s*>$/.test(whole)) stack.push(name);
}
if (stack.length) fail(`Unclosed HTML tag(s): ${stack.slice(-8).join(', ')}.`);

if (!html.includes('href="/assets/css/app.css')) fail('index.html does not reference assets/css/app.css.');
if (!/<script[^>]+src=["']\/assets\/js\/app\.js(?:\?[^"']*)?["']/i.test(html)) fail('index.html does not reference assets/js/app.js.');
if (/<style\b/i.test(html)) fail('index.html still contains inline <style> blocks.');
const inlineScriptCount = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => !/\bsrc\s*=/.test(match[1]) && match[2].trim()).length;
if (inlineScriptCount) fail(`index.html still contains ${inlineScriptCount} inline executable <script> block(s).`);
const htmlAssetPattern = /<(?:script|link|img|source|audio|video|iframe|object|embed)\b[^>]*?\b(?:src|href|poster|data)=["']([^"']+)["'][^>]*>/gi;
for (const match of html.matchAll(htmlAssetPattern)) checkAssetReference(match[1], path.join(root, 'index.html'), 'index.html');

const manifest = parseJson('manifest.json');
for (const group of ['icons', 'screenshots']) {
  for (const asset of manifest[group] || []) checkAssetReference(asset.src, path.join(root, 'manifest.json'), 'manifest.json');
}
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  checkCssStructure(css, relative);
  if (/@import\s+url\(["']?https:\/\/fonts\.googleapis\.com/i.test(css)) fail('Google Fonts must be loaded via <link>, not CSS @import.');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) checkAssetReference(match[1], file, relative);
}

const main = read('desktop/main.cjs');
if (/return ['"]https:\/\/YOUR-VERCEL-DOMAIN/.test(main)) fail('Desktop launcher still contains a placeholder fallback production domain.');
const desktopConfig = parseJson('desktop/config.json');
if (!/^https:\/\//.test(String(desktopConfig.productionUrl || ''))) fail('desktop/config.json must contain an HTTPS productionUrl.');
const vercel = parseJson('vercel.json');
const headerNames = new Set((vercel.headers || []).flatMap(item => (item.headers || []).map(header => header.key)));
if (String(pkg.devDependencies?.electron || '').localeCompare('45.0.0', undefined, { numeric: true, sensitivity: 'base' }) < 0) fail('Electron must be on a supported 45.x-or-newer release line.');
if (!Array.isArray(vercel.crons) || !vercel.crons.some(item => item && item.path === '/api/cron/backup')) fail('Scheduled encrypted backup cron is not configured.');
for (const required of ['Strict-Transport-Security','X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Permissions-Policy']) {
  if (!headerNames.has(required)) fail(`Missing Vercel security header: ${required}`);
}

const frontend = html + '\n' + appJs;
if (!frontend.includes("authAction === 'login' ? '/api/login'")) fail('Frontend login is not routed to /api/login.');
if (!frontend.includes("authAction === 'loginState' ? '/api/login-state'")) fail('Frontend session checks are not routed to /api/login-state.');
const tokenLocalStorage = [...frontend.matchAll(/localStorage\.setItem\(([^\n]+)\)/g)]
  .some(match => /token|session/i.test(match[1]));
if (tokenLocalStorage) fail('Authentication token appears to be stored in localStorage.');
if (appJs.includes('YOUR-VERCEL-DOMAIN')) fail('Placeholder production domain found in frontend JS.');
if (/var visitorAccessCatalog\s*=\s*\[\s*\{/.test(appJs)) fail('Visitor page catalog is duplicated in frontend JavaScript.');

const versionFiles = ['api/dashboard.js', 'api/login.js', 'api/login-state.js', 'api/bridge.js'];
for (const file of versionFiles) {
  if (!/require\(["'][^"']*package\.json["']\)\.version/.test(read(file))) fail(`${file} does not derive its application version from package.json.`);
}
if (lock.packages?.['']?.version !== pkg.version) fail('package.json and package-lock.json versions do not match.');
const versionLabel = html.match(/<span\b[^>]*\bid=["']aboutAppVersion["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]?.trim();
if (versionLabel && versionLabel !== '—' && versionLabel !== pkg.version) fail('index.html contains a hard-coded application version that conflicts with package.json.');
if (/appVersion\s*:\s*["']\d+\.\d+\.\d+["']/.test(appJs)) fail('assets/js/app.js contains a hard-coded application version that conflicts with package.json.');
if (/\bhoagpathology-v\d+\.\d+\.\d+\b/i.test(read('sw.js'))) fail('sw.js embeds a duplicate application version in its cache name.');
if (!/var appVersion = \(data && data\.version\) \|\| '—';/.test(appJs)) fail('Frontend application version does not consume dashboard API metadata.');

for (const [name, range] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies })) {
  if (!lock.packages?.[`node_modules/${name}`]) fail(`Dependency is missing from package-lock.json: ${name}`);
  try { require.resolve(name, { paths: [root] }); }
  catch { fail(`Required npm dependency is not installed: ${name} (${range})`); }
}

for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/i.test(file))) {
  const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (syntax.status !== 0) fail(`JavaScript syntax error in ${path.relative(root, file)}: ${syntax.stderr || syntax.stdout}`);
}

const importPattern = /\b(?:from\s*|import\s*\(|require\s*\()\s*(['"])([^'"]+)\1/g;
for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/i.test(file))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[2];
    if (specifier.startsWith('node:') || builtinModules.includes(specifier)) continue;
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const base = path.resolve(path.dirname(file), specifier);
      const candidates = [base, ...['.js','.mjs','.cjs','.json'].map(extension => base + extension), ...['index.js','index.mjs','index.cjs'].map(name => path.join(base, name))];
      if (!candidates.some(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) fail(`Unresolved local import in ${path.relative(root, file)}: ${specifier}`);
      continue;
    }
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (!pkg.dependencies?.[packageName] && !pkg.devDependencies?.[packageName] && !pkg.optionalDependencies?.[packageName]) fail(`Undeclared package import in ${path.relative(root, file)}: ${packageName}`);
  }
}

const bridge = read('api/bridge.js');
const visitorGuards = [
  [/case 'getSharedInventory':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'INVENTORY', 'inventory\.read'\)/, 'Inventory read'],
  [/case 'getOutsourceSamples':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'OUTSOURCE', 'outsource\.read'\)/, 'Outsource read'],
  [/case 'getNotificationRecords':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'notification', 'notification\.read'\)/, 'Notification read'],
  [/case 'getUserRosterEnvelope':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'calendar', 'roster\.read'\)/, 'Calendar roster read'],
  [/case 'getTransfusionRecords':\s*\{\s*const s = requireModuleAccess\(await requireSession\(db, tokenAt\(0\)\), 'TRANSFUSION', \['transfusion\.read\.own', 'transfusion\.read\.all'\]\)/, 'Transfusion read']
];
for (const [pattern, label] of visitorGuards) if (!pattern.test(bridge)) fail(`Visitor page/permission guard is missing for ${label}.`);
if (!/case 'getMalaysiaHolidayData':\s*\{\s*requireModuleAccess\(await requireSession\(db, cookieValue\(req, 'labapp_session'\)\), 'calendar', 'calendar\.read'\)/.test(bridge)) fail('Visitor page/permission guard is missing for Calendar holiday data.');
if (!/requireModuleAccess\(session, 'TRANSFUSION', \['transfusion\.read\.own', 'transfusion\.read\.all'\]\)/.test(read('api/transfusion.js'))) fail('Direct transfusion API does not enforce Visitor page access and read permission.');
if (!/requireModuleAccess\([\s\S]*?'TRANSFUSION',[\s\S]*?operation === 'put'[\s\S]*?'transfusion\.read\.all'/.test(read('api/transfusion-blob-url.js'))) fail('Transfusion file API does not enforce Visitor page access and operation permission.');
if (!/visitorYearLocked = isVisitorAccessRestricted\(\)[\s\S]*?externalUrl = visitorYearLocked \? ''/.test(appJs)) fail('Visitor pathology year cards are no longer locked from external links.');
if (!bridge.includes("chatId.startsWith('dm:')&&s.role!=='ADMIN'")) fail('Direct-chat read authorization guard is missing.');
if (!bridge.includes("m.chatType==='direct'&&s.role!=='ADMIN'")) fail('Direct-chat reaction authorization guard is missing.');
if (!bridge.includes('Existing inventory movements are immutable for non-admin users.')) fail('Non-admin inventory mutation guard is missing.');
if (!bridge.includes('inventoryMovementSchema.array().max(1000)')) fail('Inventory movement schema validation is missing.');

const sessionSource = read('lib/session.js');
if (!/SYSTEM_LOG_RETENTION_DAYS\s*=\s*14/.test(sessionSource) || !/\.lt\('created_at', cutoff\)[\s\S]*?\.limit\(SYSTEM_LOG_RETENTION_BATCH_SIZE\)/.test(sessionSource) || !/\.delete\(\)\s*\.in\('id', expiredIds\)/.test(sessionSource)) fail('System log retention is not bounded by the configured age and batch limit.');
if (!/applySystemLogRetention\(\)/.test(read('api/bridge.js'))) fail('System log retrieval does not enforce canonical retention.');
if (!/action: 'LOGIN'/.test(read('api/login.js')) || /case 'recordSuccessfulLogin':\s*\{[^}]*await log\(/.test(bridge)) fail('Successful login logging has multiple authoritative paths.');
const transfusion = read('api/transfusion.js');
if (!/READ-ONLY legacy compatibility/.test(transfusion)) fail('Transfusion legacy compatibility must be read-only.');
if (/ensureIndependentRecords[\s\S]*?\.update\(/.test(transfusion)) fail('Transfusion read path must not rewrite legacy records.');

console.log(`Hoag Pathology audit v${pkg.version}`);
console.log(`Files checked: ${relativeFiles.length} (excluding installed dependencies)`);
console.log(`HTML structure and IDs: ${counts.size} unique IDs / ${ids.length} total`);
console.log(`Local HTML and manifest assets: checked`);
console.log(`CSS structural syntax: ${cssFiles.length} files checked`);
console.log(`JavaScript syntax and imports: ${files.filter(file => /\.(?:js|mjs|cjs)$/i.test(file)).length} files checked`);
console.log(`Dependencies resolved: ${Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies }).length}`);
console.log(`Application version source: package.json ${pkg.version}`);
console.log(`Visitor API guards and log retention: checked`);
console.log(`Security headers: ${headerNames.size}`);

if (failures.length) {
  console.error('\nFAILURES');
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}
console.log('Audit passed.');
