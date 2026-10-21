import { createHash, randomUUID } from 'node:crypto';
import { firebaseDb } from '../lib/firebase-admin.js';
import { normalizeUserId, normalizePassword, buildPasswordRecord, verifyPassword, isLegacyPassword } from '../lib/auth.js';

const SESSION_SECONDS = 6 * 60 * 60;
const USERS_PATH = 'labapp/auth/users';
const SESSIONS_PATH = 'labapp/auth/sessions';
const SETTINGS_PATH = 'labapp/settings';
const clean = (v, max=3000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0,max);
const tokenHash = token => createHash('sha256').update(`token\n${String(token || '')}`, 'utf8').digest('hex');
const getIp = req => (String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '') || 'unknown').slice(0,120);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ ok:false, authenticated:false, error:'Method not allowed' });

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const username = normalizeUserId(body.username);
    const password = normalizePassword(body.password);
    if (!username || !password) return res.status(400).json({ ok:false, authenticated:false, error:'Please enter your username and password.' });

    const db = firebaseDb();
    const settings = (await db.ref(SETTINGS_PATH).get()).val() || {};
    const ip = getIp(req);
    const userKey = createHash('sha256').update(`login-user\n${username}`).digest('hex').slice(0,32);
    const ipKey = createHash('sha256').update(`login-ip\n${ip}`).digest('hex').slice(0,32);
    const failures = settings.loginFailures || {};
    const failedUser = failures[userKey] || {};
    const failedIp = failures[ipKey] || {};
    if (Number(failedUser.until || 0) > Date.now() || Number(failedIp.until || 0) > Date.now()) {
      return res.status(429).json({ ok:false, authenticated:false, error:'Too many failed attempts. Please try again in a few minutes.' });
    }

    const stored = (await db.ref(USERS_PATH).get()).val();
    const users = Array.isArray(stored?.users) ? stored.users : stored && typeof stored === 'object' ? Object.values(stored).filter(item => item && typeof item === 'object' && (item.userId || item.id || item.username)) : [];
    const user = users.find(item => normalizeUserId(item.userId || item.id || item.username) === username && item.deleted !== true);
    if (!user || user.active === false || !verifyPassword(user, password)) {
      const userCount = Number(failedUser.count || 0) + 1;
      const ipCount = Number(failedIp.count || 0) + 1;
      await Promise.all([
        db.ref(`${SETTINGS_PATH}/loginFailures/${userKey}`).set({count:userCount,until:userCount>=5?Date.now()+300000:0,kind:'user'}),
        db.ref(`${SETTINGS_PATH}/loginFailures/${ipKey}`).set({count:ipCount,until:ipCount>=20?Date.now()+300000:0,kind:'ip'})
      ]);
      return res.status(401).json({ ok:false, authenticated:false, error:'Invalid username or password.' });
    }

    if (settings.maintenance?.enabled && normalizeUserId(user.role) !== 'ADMIN') return res.status(503).json({ ok:false, authenticated:false, error:clean(settings.maintenance.message || 'System is temporarily under maintenance.',300) });
    await Promise.all([db.ref(`${SETTINGS_PATH}/loginFailures/${userKey}`).remove(), db.ref(`${SETTINGS_PATH}/loginFailures/${ipKey}`).remove()]);

    if (isLegacyPassword(user)) {
      const upgraded = buildPasswordRecord(password);
      const nextUsers = users.map(u => normalizeUserId(u.userId || u.id || u.username) === username ? {...u,...upgraded,updatedAt:new Date().toISOString()} : u);
      const old = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
      await db.ref(USERS_PATH).set({...old,version:3,updatedAt:new Date().toISOString(),users:nextUsers});
    }

    const now = Date.now();
    const issuedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + SESSION_SECONDS * 1000).toISOString();
    const token = `${randomUUID()}.${randomUUID()}.${now}`;
    const session = { userId:username, name:String(user.displayName || username), role:String(user.role || 'USER'), issuedAt, expiresAt };
    await db.ref(`${SESSIONS_PATH}/${tokenHash(token)}`).set(session);
    // Session is returned to the client and kept in sessionStorage only.
    res.setHeader('Set-Cookie', 'labapp_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
    return res.status(200).json({ ok:true, authenticated:true, token, expiresAt, expiresIn:SESSION_SECONDS, user:{id:username,name:session.name,role:session.role}, version:'2.1.81' });
  } catch (error) {
    console.error('Login endpoint failed:', error?.message || 'Unknown error');
    return res.status(500).json({ ok:false, authenticated:false, error:'An unexpected system error occurred during sign-in.' });
  }
}
