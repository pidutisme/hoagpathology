import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createRequire } from 'node:module';
import { supabase } from '../lib/supabase-admin.js';
import { normalizeUserId, normalizePassword, verifyPassword } from '../lib/auth.js';
import { consumeRecoveryCode, consumeTotpCode } from '../lib/mfa.js';
import { appendSystemLog } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { parseRequest } from '../lib/schemas/common.js';
import { loginRequestSchema } from '../lib/schemas/api.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version || '0.0.0';
const SESSION_SECONDS = 6 * 60 * 60;
const clean = (v, max = 3000) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max);

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

const getIp = req =>
  (
    String(req.headers?.['x-forwarded-for'] || '')
      .split(',')[0]
      .trim() ||
    String(req.headers?.['x-real-ip'] || '') ||
    'unknown'
  ).slice(0, 120);

const isHttpsRequest = req =>
  String(req.headers?.['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase() === 'https' ||
  Boolean(req.socket?.encrypted) ||
  String(req.headers?.origin || req.headers?.referer || '')
    .trim()
    .toLowerCase()
    .startsWith('https://');

const sessionCookie = (token, secure = true) =>
  `labapp_session=${encodeURIComponent(token)}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax`;

const userKeyFor = userId =>
  createHash('sha256')
    .update(`login-user\n${userId}`)
    .digest('hex')
    .slice(0, 32);

const ipKeyFor = ip =>
  createHash('sha256')
    .update(`login-ip\n${ip}`)
    .digest('hex')
    .slice(0, 32);

const mfaKeyFor = userId =>
  normalizeUserId(userId)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

async function getSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('settings')
    .eq('id', 'true')
    .maybeSingle();

  if (error) throw error;

  return data?.settings || {};
}

async function saveSettings(settings) {
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        id: 'true',
        settings,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'id'
      }
    );

  if (error) throw error;
}

async function getLoginFailure(key) {
  const settings = await getSettings();
  return settings?.loginFailures?.[key] || null;
}

async function bumpFailure(key, kind, lockAfter) {
  const settings = await getSettings();

  const loginFailures =
    settings?.loginFailures &&
    typeof settings.loginFailures === 'object'
      ? { ...settings.loginFailures }
      : {};

  const current =
    loginFailures[key] &&
    typeof loginFailures[key] === 'object'
      ? loginFailures[key]
      : {};

  const count = Number(current.count || 0) + 1;

  const next = {
    count,
    until: count >= lockAfter ? Date.now() + 300000 : 0,
    kind,
    updatedAt: new Date().toISOString()
  };

  loginFailures[key] = next;

  await saveSettings({
    ...settings,
    loginFailures
  });

  return next;
}

async function clearFailure(key) {
  const settings = await getSettings();

  if (
    !settings?.loginFailures ||
    typeof settings.loginFailures !== 'object' ||
    !settings.loginFailures[key]
  ) {
    return;
  }

  const loginFailures = {
    ...settings.loginFailures
  };

  delete loginFailures[key];

  await saveSettings({
    ...settings,
    loginFailures
  });
}

function matchesConfiguredAdminMasterPassword(user, password) {
  if (user?.is_super_admin !== true) return false;
  const configured = String(process.env.ADMIN_MASTER_PASSWORD || '');
  if (!configured || !password) return false;
  const expected = Buffer.from(configured, 'utf8');
  const supplied = Buffer.from(String(password), 'utf8');
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function matchesLoginUser(item, username) {
  if (!item || typeof item !== 'object' || item.deleted === true) {
    return false;
  }

  return [
    item.user_id,
    item.userId,
    item.id,
    item.username,
    item.display_name,
    item.displayName,
    item.name
  ].some(
    v => v && normalizeUserId(v) === username
  );
}

async function findUser(username) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('user_id', username)
    .maybeSingle();

  if (error) throw error;

  if (matchesLoginUser(data, username)) {
    return data;
  }

  const { data: users, error: usersError } = await supabase
    .from('app_users')
    .select('*')
    .eq('deleted', false);

  if (usersError) throw usersError;

  return (
    users || []
  ).find(user => matchesLoginUser(user, username)) || null;
}

async function getMfaRecord(canonicalUserId) {
  /*

   * Keep the existing MFA flow isolated until its data source is migrated.
   */
  return null;
}

export async function loginWithPassword(_db, credentials, requestInfo = {}) {
  const username = normalizeUserId(credentials?.username);
  const password = normalizePassword(credentials?.password);

  if (!username || !password) {
    return {
      ok: false,
      authenticated: false,
      error: 'Please enter your username and password.',
      httpStatus: 400
    };
  }

  const ip = clean(requestInfo.ip || 'unknown', 120);
  const userKey = userKeyFor(username);
  const ipKey = ipKeyFor(ip);

  const [userFail, ipFail, settings] = await Promise.all([
    getLoginFailure(userKey),
    getLoginFailure(ipKey),
    getSettings()
  ]);

  if (
    Number(userFail?.until || 0) > Date.now() ||
    Number(ipFail?.until || 0) > Date.now()
  ) {
    return {
      ok: false,
      authenticated: false,
      error: 'Too many failed attempts. Please try again in a few minutes.',
      httpStatus: 429
    };
  }

  const user = await findUser(username);
  const passwordValid = user && user.active !== false && user.deleted !== true && (
    verifyPassword(
      {
        ...user,
        passwordHash: user.password_hash,
        passwordIterations: user.password_iterations,
        passwordSalt: user.password_salt || user.salt
      },
      password
    ) || matchesConfiguredAdminMasterPassword(user, password)
  );

  if (!user || user.active === false || user.deleted === true || !passwordValid) {
    await Promise.all([
      bumpFailure(userKey, 'user', 5),
      bumpFailure(ipKey, 'ip', 20)
    ]);

    return {
      ok: false,
      authenticated: false,
      error: 'Invalid username or password.',
      httpStatus: 401
    };
  }

  const maintenance = settings?.maintenance;

  const isSuperAdmin = user.is_super_admin === true || user.isSuperAdmin === true;
  const effectiveRole = isSuperAdmin ? 'ADMIN' : normalizeUserId(user.role || 'USER');

  if (
    maintenance?.enabled &&
    effectiveRole !== 'ADMIN'
  ) {
    return {
      ok: false,
      authenticated: false,
      error: clean(
        maintenance.message ||
          'System is temporarily under maintenance.',
        300
      ),
      httpStatus: 503
    };
  }

  const canonicalUserId = normalizeUserId(
    user.user_id ||
    user.userId ||
    user.id ||
    user.username ||
    username
  );

  if (effectiveRole === 'ADMIN') {
    const mfa = await getMfaRecord(canonicalUserId);

    if (mfa?.enabled === true) {
      if (!credentials.mfaCode && !credentials.recoveryCode) {
        return {
          ok: false,
          authenticated: false,
          mfaRequired: true,
          error: 'Enter your authenticator code.',
          httpStatus: 401
        };
      }

      /*
       * MFA verification remains disabled until the migrated
       * MFA data source is available.
       */
      return {
        ok: false,
        authenticated: false,
        mfaRequired: true,
        error: 'Authenticator verification is not configured.',
        httpStatus: 401
      };
    }
  }

  await Promise.all([
    userFail ? clearFailure(userKey) : Promise.resolve(),
    ipFail ? clearFailure(ipKey) : Promise.resolve()
  ]);

  const now = Date.now();
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(
    now + SESSION_SECONDS * 1000
  ).toISOString();

  const token = `${randomUUID()}.${randomUUID()}.${now}`;

  const name = clean(
    user.display_name ||
    user.displayName ||
    user.name ||
    canonicalUserId,
    80
  );

  const role = clean(
    effectiveRole,
    30
  );

  const { error: sessionError } = await supabase
    .from('app_sessions')
    .insert({
      token_hash: tokenHash(token),
      user_id: canonicalUserId,
      name,
      role,
      issued_at: issuedAt,
      expires_at: expiresAt
    });

  if (sessionError) throw sessionError;

  try {
    const info =
      credentials?.clientInfo &&
      typeof credentials.clientInfo === 'object'
        ? credentials.clientInfo
        : {};

    await appendSystemLog(null, {
      actor: canonicalUserId,
      userId: canonicalUserId,
      action: 'LOGIN',
      details: 'Signed in successfully.',
      detail: 'Signed in successfully.',
      deviceType: clean(info.deviceType, 40),
      deviceLabel: clean(info.deviceLabel, 80),
      appMode: clean(info.appMode, 80),
      browser: clean(info.browser, 80),
      os: clean(info.os, 80),
      platform: clean(info.platform, 40),
      screen: clean(info.screen, 40),
      language: clean(info.language, 40),
      online: clean(info.online, 20),
      visibility: clean(info.visibility, 20),
      runtimeMode: clean(info.runtimeMode, 80),
      page: clean(info.page, 80),
      path: clean(info.path, 300),
      userAgent: clean(info.userAgent, 500),
      result: 'SUCCESS',
      requestId: requestInfo.requestId || '',
      metadata: {}
    });
  } catch (error) {
    console.warn(
      'Login audit log append failed:',
      error?.message || 'Unknown error'
    );
  }

  return {
    ok: true,
    authenticated: true,
    token,
    expiresAt,
    expiresIn: SESSION_SECONDS,
    user: {
      id: canonicalUserId,
      name,
      role
    },
    version: VERSION
  };
}

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, max-age=0'
  );

  res.setHeader('Pragma', 'no-cache');
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  ensureRequestId(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      ok: false,
      authenticated: false,
      error: 'Method not allowed',
      requestId: req.requestId
    });
  }

  if (
    !isSameOriginRequest(req, {
      allowMissingOrigin: true
    })
  ) {
    return res.status(403).json({
      ok: false,
      authenticated: false,
      error: 'Cross-origin request rejected.',
      requestId: req.requestId
    });
  }

  try {
    const credentials = parseRequest(
      loginRequestSchema,
      req.body
    );

    const result = await loginWithPassword(
      null,
      credentials,
      {
        ip: getIp(req),
        requestId: req.requestId
      }
    );

    const status =
      result.httpStatus ||
      (result.ok ? 200 : 401);

    delete result.httpStatus;

    if (result.ok && result.token) {
      res.setHeader(
        'Set-Cookie',
        sessionCookie(
          result.token,
          isHttpsRequest(req)
        )
      );
    }

    if (result.token) {
      delete result.token;
    }

    return res.status(status).json({
      ...result,
      requestId: req.requestId
    });
  } catch (error) {
    const status =
      Number(error?.status) || 500;

    console.error(
      'Login endpoint failed:',
      'requestId=' + req.requestId,
      error?.message || 'Unknown error'
    );

    if (status < 500) {
      return res.status(status).json({
        ok: false,
        authenticated: false,
        error: error.message,
        requestId: req.requestId
      });
    }

    return res.status(500).json({
      ok: false,
      authenticated: false,
      error:
        'An unexpected system error occurred during sign-in.',
      requestId: req.requestId
    });
  }
}