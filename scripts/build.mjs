import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { builtinModules } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_ID_PLACEHOLDER = '__LABPORTAL_BUILD_ID__';
const BUILD_ID_LENGTH = 12;

function updateMetaContent(html, name, value) {
  const pattern = new RegExp(`(<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*\\bcontent=["'])[^"']*(["'][^>]*>)`, 'i');
  if (!pattern.test(html)) throw new Error(`index.html is missing the ${name} metadata tag.`);
  return html.replace(pattern, (_match, prefix, suffix) => `${prefix}${value}${suffix}`);
}

function normalizeBuildMetadata(filePath, content) {
  if (filePath !== 'index.html' || typeof content !== 'string') return content;
  return updateMetaContent(content, 'labportal-build-id', BUILD_ID_PLACEHOLDER);
}

export function calculateBuildId(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError('Build ID input must contain deployed application files.');
  }
  const sorted = entries.map(entry => ({
    path: String(entry?.path || '').replaceAll('\\', '/').replace(/^\.\//, ''),
    content: entry?.content
  })).sort((left, right) => left.path.localeCompare(right.path));
  if (sorted.some(entry => !entry.path || entry.path.startsWith('/') || entry.path.split('/').includes('..'))) {
    throw new TypeError('Build ID input contains an invalid project-relative path.');
  }
  const hash = createHash('sha256');
  for (const entry of sorted) {
    hash.update(entry.path, 'utf8');
    hash.update('\0', 'utf8');
    const content = normalizeBuildMetadata(entry.path, entry.content);
    hash.update(Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ''), 'utf8'));
    hash.update('\0', 'utf8');
  }
  return hash.digest('hex').slice(0, BUILD_ID_LENGTH).toUpperCase();
}

function walk(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ['node_modules', '.git', 'dist', 'dist-desktop'].includes(entry.name)) continue;
    if (entry.name.includes('\\') || entry.name.includes('/')) throw new Error(`Invalid project file name: ${entry.name}`);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, result);
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function isBuildContentFile(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  return ['api/', 'assets/', 'desktop/', 'lib/'].some(prefix => relative.startsWith(prefix)) ||
    ['index.html', 'manifest.json', 'package.json', 'package-lock.json', 'sw.js', 'vercel.json'].includes(relative);
}

function runBuild() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const required = ['api', 'assets/css', 'assets/js', 'desktop', 'lib', 'scripts', 'tests'];
  for (const relative of required) {
    if (!fs.statSync(path.join(root, relative), { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`Required project directory is missing: ${relative}`);
    }
  }
  const files = walk(root);
  for (const relative of ['api/login.js', 'api/bridge.js', 'tests/auth.test.js']) {
    if (!fs.statSync(path.join(root, relative), { throwIfNoEntry: false })?.isFile()) {
      throw new Error(`Required source file is missing: ${relative}`);
    }
  }
  for (const file of files.filter(file => /\.(?:js|mjs|cjs)$/.test(file))) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`Syntax check failed for ${path.relative(root, file)}:\n${result.stderr || result.stdout}`);
  }
  if (lock.packages?.['']?.version !== pkg.version || lock.packages?.['']?.name !== pkg.name) {
    throw new Error('package.json and package-lock.json root metadata do not match.');
  }
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
  for (const file of files.filter(file => /\.json$/i.test(file))) JSON.parse(fs.readFileSync(file, 'utf8'));

  const indexPath = path.join(root, 'index.html');
  const originalHtml = fs.readFileSync(indexPath, 'utf8');
  const versionedHtml = updateMetaContent(originalHtml, 'labportal-release-version', pkg.version);
  const buildFiles = files.filter(isBuildContentFile).sort((left, right) => left.localeCompare(right));
  const entries = buildFiles.map(file => {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    return {
      path: relative,
      content: relative === 'index.html' ? versionedHtml : fs.readFileSync(file)
    };
  });
  const buildId = calculateBuildId(entries);
  const builtHtml = updateMetaContent(versionedHtml, 'labportal-build-id', buildId);
  if (builtHtml !== originalHtml) fs.writeFileSync(indexPath, builtHtml, 'utf8');

  for (const asset of ['/assets/css/app.css', '/assets/js/app.js']) {
    if (!builtHtml.includes(asset)) throw new Error(`index.html does not reference ${asset}`);
    if (!fs.existsSync(path.join(root, asset.slice(1)))) throw new Error(`Referenced asset is missing: ${asset}`);
  }
  console.log(`Build checks passed: ${files.length} files, syntax, JSON, dependencies, and HTML assets.`);
  console.log(`Release version: ${pkg.version}`);
  console.log(`Local content Build ID: ${buildId}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runBuild();
