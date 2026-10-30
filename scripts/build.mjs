import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const required = ['api', 'assets/css', 'assets/js', 'desktop', 'lib', 'scripts', 'tests'];
for (const rel of required) {
  if (!fs.statSync(path.join(root, rel), { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`Required project directory is missing: ${rel}`);
  }
}
const files = [];
const invalidNames = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ['node_modules', '.git', 'dist', 'dist-desktop'].includes(entry.name)) continue;
    if (entry.name.includes('\\') || entry.name.includes('/')) invalidNames.push(entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) files.push(full);
  }
}
walk(root);
if (invalidNames.length) throw new Error(`Invalid file names: ${invalidNames.join(', ')}`);
for (const rel of ['api/login.js', 'api/bridge.js', 'tests/auth.test.js']) {
  if (!fs.statSync(path.join(root, rel), { throwIfNoEntry: false })?.isFile()) throw new Error(`Required source file is missing: ${rel}`);
}
for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/.test(file))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Syntax check failed for ${path.relative(root, file)}:\n${result.stderr || result.stdout}`);
}
if (lock.packages?.['']?.version !== pkg.version) throw new Error('package.json and package-lock.json versions do not match.');
for (const dependency of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies })) {
  if (!lock.packages?.[`node_modules/${dependency}`]) throw new Error(`Dependency is missing from package-lock.json: ${dependency}`);
}
const importPattern = /\b(?:from\s*|import\s*\(|require\s*\()\s*(['"])([^'"]+)\1/g;
for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/.test(file))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[2];
    if (specifier.startsWith('node:') || builtinModules.includes(specifier)) continue;
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const base = path.resolve(path.dirname(file), specifier);
      const candidates = [base, ...['.js', '.mjs', '.cjs', '.json'].map(extension => base + extension), ...['index.js', 'index.mjs', 'index.cjs'].map(name => path.join(base, name))];
      if (!candidates.some(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) {
        throw new Error(`Unresolved local import in ${path.relative(root, file)}: ${specifier}`);
      }
      continue;
    }
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (!pkg.dependencies?.[packageName] && !pkg.devDependencies?.[packageName] && !pkg.optionalDependencies?.[packageName]) {
      throw new Error(`Undeclared package import in ${path.relative(root, file)}: ${packageName}`);
    }
  }
}
for (const file of files.filter(file => /\.json$/.test(file))) JSON.parse(fs.readFileSync(file, 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const asset of ['/assets/css/app.css', '/assets/js/app.js']) {
  if (!html.includes(asset)) throw new Error(`index.html does not reference ${asset}`);
  if (!fs.existsSync(path.join(root, asset.slice(1)))) throw new Error(`Referenced asset is missing: ${asset}`);
}
console.log(`Build checks passed: ${files.length} files, JavaScript syntax, JSON configuration, filesystem layout, and HTML assets.`);
