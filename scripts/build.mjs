import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const include = [
  'api',
  'assets',
  'lib',
  'desktop',
  'index.html',
  'manifest.json',
  'sw.js',
  'vercel.json',
  'package.json',
  'package-lock.json'
];
const files = [];

function walk(p) {
  if (!fs.existsSync(p)) return;
  const s = fs.statSync(p);
  if (s.isDirectory()) {
    for (const n of fs.readdirSync(p).sort()) {
      walk(path.join(p, n));
    }
  } else {
    files.push(p);
  }
}

for (const p of include) {
  walk(path.join(root, p));
}

const h = crypto.createHash('sha256');
const rx = /(<meta\s+name="labportal-build-id"\s+content=")[A-F0-9]{12}(")/i;

for (const f of files.sort()) {
  let b = fs.readFileSync(f);
  if (path.basename(f) === 'index.html') {
    b = Buffer.from(b.toString('utf8').replace(rx, '$1BUILD_ID$2'));
  }
  h.update(path.relative(root, f).replaceAll(path.sep, '/'));
  h.update('\0');
  h.update(b);
  h.update('\0');
}

const id = h.digest('hex').slice(0, 12).toUpperCase();
const ip = path.join(root, 'index.html');
let html = fs.readFileSync(ip, 'utf8');
if (!rx.test(html)) {
  throw new Error('labportal-build-id meta tag missing');
}
html = html.replace(rx, '$1' + id + '$2');
fs.writeFileSync(ip, html);
console.log('LabPortal build PASS - local Build ID ' + id);

