import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');

test('HttpOnly session cookie is configured and raw token is not returned by dedicated login endpoint', () => {
  const login = read('api/login.js');
  assert.match(login, /HttpOnly; Secure; SameSite=Lax/);
  assert.match(login, /delete result\.token|return res\.status\(200\)\.json\(\{ ok:true, authenticated:true/);
});

test('Fresh page sessions cannot inherit an older HttpOnly auth cookie', () => {
  const loginState = read('api/login-state.js');
  const app = read('assets/js/app.js');
  assert.match(loginState, /freshSession === true/);
  assert.match(loginState, /Max-Age=0; Path=\/; HttpOnly; Secure; SameSite=Lax/);
  assert.match(app, /var hasPageSession = !!getStoredPublicUser_\(\);/);
  assert.match(app, /hoagApiRequest\('loginState', \{ freshSession: !hasPageSession \}\)/);
});

test('CSP is present and does not enable unsafe-eval', () => {
  const vercel = read('vercel.json');
  assert.match(vercel, /Content-Security-Policy/);
  assert.doesNotMatch(vercel, /unsafe-eval/);
});

test('Firebase rules deny sensitive roots and restrict client writes', () => {
  const rules = JSON.parse(read('database.rules.json'));
  assert.equal(rules.rules['.read'], false);
  assert.equal(rules.rules['.write'], false);
  assert.equal(rules.rules.labapp.auth['.read'], false);
  assert.equal(rules.rules.labapp.settings['.write'], false);
  assert.match(rules.rules.labapp.notes.items['$noteId']['.write'], /savedByUserId/);
});

test('Frontend contains no code path that stores the raw session token', () => {
  const app = read('assets/js/app.js');
  assert.doesNotMatch(app, /safeSessionSet\(TOKEN_KEY,\s*token\)/);
  assert.match(app, /HTTPONLY_SESSION_SENTINEL/);
});

test('Dashboard cards use CSP-compatible data actions instead of inline onclick handlers', () => {
  const html = read('index.html');
  const expected = ['OUTSOURCE','INVENTORY','TRANSFUSION','POCT','Chemical Pathology','Hematology','Microbiology','Urine/Stool Analysis'];
  for (const moduleName of expected) {
    assert.match(html, new RegExp('data-dashboard-module="' + moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'));
  }
  assert.doesNotMatch(html, /class="(?:stat-card|bottom-card) clickable-card" onclick=/);
  const js = read('assets/js/app.js');
  assert.match(js, /bindDashboardCards/);
  assert.match(js, /data-dashboard-module/);
});

test('Login and logout remain functional under strict CSP', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /onclick=/);
  assert.doesNotMatch(html, /action=["']javascript:/i);
  assert.match(html, /id="loginForm"/);
  assert.match(html, /id="logoutBtn"/);

  const app = read('assets/js/app.js');
  assert.match(app, /nodes\.form\.addEventListener\('submit', submitLogin\)/);
  assert.match(app, /logoutButton\.addEventListener\('click', function \(\) \{ logout\(\); \}\)/);
  assert.match(app, /hoagApiRequest\('logout'/);
  assert.doesNotMatch(app, /if \(token\) \{\s*hoagApiRequest\('logout'/);
});
