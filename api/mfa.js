import { createHash } from 'node:crypto';
import { z } from 'zod';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase-admin.js';
import { sessionFor, appendSystemLog } from '../lib/session.js';
import { normalizeUserId, normalizePassword, verifyPassword } from '../lib/auth.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { parseRequest, boundedText } from '../lib/schemas/common.js';
import {
  consumeTotpCode,
  consumeRecoveryCode,
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  matchingTotpCounter,
  newTotpSecret,
  recoveryCodeHash
} from '../lib/mfa.js';

const schema = z.object({
  action: z.enum(['setup', 'enable', 'disable', 'recovery']),
  username: boundedText(80).optional(),
  password: z.string().max(200).optional(),
  code: z.string().max(32).optional(),
  recoveryCode: z.string().regex(/^[A-Z0-9-]{8,32}$/i).optional()
}).strict();

const cookieValue = (req, name) =>
  String(req.headers.cookie || '')
    .split(';')
    .map(v => v.trim())
    .find(v => v.startsWith(name + '='))
    ?.slice(name.length + 1) || '';

const ipFor = req =>
  (
    String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    String(req.headers['x-real-ip'] || '') ||
    'unknown'
  ).slice(0, 120);

function throttleKeys(username, req) {
  const userKey = createHash('sha256')
    .update('login-user\n' + normalizeUserId(username))
    .digest('hex')
    .slice(0, 32);

  const ipKey = createHash('sha256')
    .update('login-ip\n' + ipFor(req))
    .digest('hex')
    .slice(0, 32);

  return { userKey, ipKey };
}

async function getSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('data,settings')
    .eq('id', true)
    .maybeSingle();

  if (error) throw error;

  return {
    ...(data?.data || {}),
    ...(data?.settings || {})
  };
}

async function saveSettings(settings) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      id: true,
      data: settings,
      settings,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

async function throttled(keys) {
  const settings = await getSettings();
  const failures = settings.loginFailures || {};

  return (
    Number(failures[keys.userKey]?.until || 0) > Date.now() ||
    Number(failures[keys.ipKey]?.until || 0) > Date.now()
  );
}

async function recordFailure(keys, kind) {
  const settings = await getSettings();
  const failures = { ...(settings.loginFailures || {}) };

  for (const [key, scope, lockAfter] of [
    [keys.userKey, 'user', 5],
    [keys.ipKey, 'ip', 20]
  ]) {
    const current = failures[key] || {};
    const count = Number(current.count || 0) + 1;

    failures[key] = {
      count,
      until: count >= lockAfter ? Date.now() + 300000 : 0,
      kind: `${kind}-${scope}`,
      updatedAt: new Date().toISOString()
    };
  }

  await saveSettings({
    ...settings,
    loginFailures: failures
  });
}

async function clearFailures(keys) {
  const settings = await getSettings();
  const failures = { ...(settings.loginFailures || {}) };

  delete failures[keys.userKey];
  delete failures[keys.ipKey];

  await saveSettings({
    ...settings,
    loginFailures: failures
  });
}

const audit = (actorId, action, requestId) =>
  appendSystemLog(null, {
    at: new Date().toISOString(),
    actorId,
    action,
    details: '',
    result: action.endsWith('FAILURE') ? 'FAILURE' : 'SUCCESS',
    requestId,
    metadata: {}
  });

async function authenticateAdmin(username, password) {
  const normalized = normalizeUserId(username);

  if (!normalized || !password) return null;

  const { data: user, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('user_id', normalized)
    .eq('deleted', false)
    .maybeSingle();

  if (error) throw error;

  return user &&
    user.active !== false &&
    normalizeUserId(user.role) === 'ADMIN' &&
    verifyPassword(user, normalizePassword(password))
    ? user
    : null;
}

async function getMfa(userId) {
  const { data, error } = await supabase
    .from('user_mfa')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function saveMfa(userId, values) {
  const { error } = await supabase
    .from('user_mfa')
    .upsert({
      user_id: userId,
      ...values,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  ensureRequestId(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
      requestId: req.requestId
    });
  }

  if (!isSameOriginRequest(req)) {
    return res.status(403).json({
      ok: false,
      error: 'Cross-origin request rejected.',
      requestId: req.requestId
    });
  }

  try {
    const body = parseRequest(schema, req.body);

    if (body.action === 'setup' || body.action === 'enable') {
      const idInput = normalizeUserId(body.username);
      const keys = throttleKeys(idInput, req);

      if (await throttled(keys)) {
        return res.status(429).json({
          ok: false,
          error: 'Too many failed attempts. Please try again in a few minutes.',
          requestId: req.requestId
        });
      }

      const user = await authenticateAdmin(body.username, body.password);

      if (!user) {
        await recordFailure(keys, 'mfa-credentials');
        await audit(
          idInput || 'UNKNOWN',
          'MFA_ENROLLMENT_FAILURE',
          req.requestId
        );

        return res.status(401).json({
          ok: false,
          error: 'Administrator credentials are invalid.',
          requestId: req.requestId
        });
      }

      const id = normalizeUserId(user.user_id);
      const current = await getMfa(id);

      if (body.action === 'setup') {
        if (current?.enabled) {
          return res.status(409).json({
            ok: false,
            error: 'MFA is already enabled. Disable it with a current code before starting enrollment.',
            requestId: req.requestId
          });
        }

        const generated = newTotpSecret({ label: id });
        const qrCode = await QRCode.toDataURL(generated.uri);

        await saveMfa(id, {
          enabled: false,
          encrypted_secret: encryptTotpSecret(generated.secret),
          pending_until: Date.now() + 10 * 60 * 1000,
          last_counter: -1,
          recovery_hashes: {}
        });

        await audit(id, 'MFA_SETUP_STARTED', req.requestId);

        return res.status(200).json({
          ok: true,
          secret: generated.secret,
          otpauthUri: generated.uri,
          qrCode,
          expiresInSeconds: 600,
          requestId: req.requestId
        });
      }

      const pending = current;

      if (
        !pending?.encrypted_secret ||
        Number(pending.pending_until || 0) <= Date.now()
      ) {
        return res.status(400).json({
          ok: false,
          error: 'MFA setup expired. Start setup again.',
          requestId: req.requestId
        });
      }

      const secret = decryptTotpSecret(pending.encrypted_secret);
      const counter = matchingTotpCounter(secret, body.code);

      if (counter === null) {
        await recordFailure(keys, 'mfa-enrollment-code');
        await audit(id, 'MFA_ENROLLMENT_FAILURE', req.requestId);

        return res.status(401).json({
          ok: false,
          error: 'Authenticator code is invalid.',
          requestId: req.requestId
        });
      }

      const codes = generateRecoveryCodes();

      await saveMfa(id, {
        enabled: true,
        encrypted_secret: pending.encrypted_secret,
        pending_until: 0,
        last_counter: counter,
        recovery_hashes: Object.fromEntries(
          codes.map(code => [recoveryCodeHash(code), true])
        ),
        enabled_at: new Date().toISOString()
      });

      await clearFailures(keys);
      await audit(id, 'MFA_ENABLED', req.requestId);

      return res.status(200).json({
        ok: true,
        enabled: true,
        recoveryCodes: codes,
        requestId: req.requestId
      });
    }

    const sessionToken = decodeURIComponent(
      cookieValue(req, 'labapp_session')
    ).slice(0, 300);

    const session = await sessionFor(null, sessionToken);

    if (!session || session.role !== 'ADMIN') {
      return res.status(403).json({
        ok: false,
        error: 'Administrator session is required.',
        requestId: req.requestId
      });
    }

    const keys = throttleKeys(session.userId, req);

    if (await throttled(keys)) {
      return res.status(429).json({
        ok: false,
        error: 'Too many failed attempts. Please try again in a few minutes.',
        requestId: req.requestId
      });
    }

    const current = await getMfa(session.userId);

    if (!current?.enabled) {
      return res.status(409).json({
        ok: false,
        error: 'MFA is not enabled.',
        requestId: req.requestId
      });
    }

    const user = session.user;

    const factorVerified = body.code
      ? await consumeTotpCode(session.userId, body.code)
      : await consumeRecoveryCode(session.userId, body.recoveryCode);

    if (
      !verifyPassword(user, normalizePassword(body.password)) ||
      !factorVerified
    ) {
      await recordFailure(keys, 'mfa-management');
      await audit(
        session.userId,
        'MFA_MANAGEMENT_FAILURE',
        req.requestId
      );

      return res.status(401).json({
        ok: false,
        error: 'Current password or authenticator code is invalid.',
        requestId: req.requestId
      });
    }

    await clearFailures(keys);

    if (body.action === 'disable') {
      const { error } = await supabase
        .from('user_mfa')
        .delete()
        .eq('user_id', session.userId);

      if (error) throw error;

      await audit(session.userId, 'MFA_DISABLED', req.requestId);

      return res.status(200).json({
        ok: true,
        enabled: false,
        requestId: req.requestId
      });
    }

    const codes = generateRecoveryCodes();

    await saveMfa(session.userId, {
      recovery_hashes: Object.fromEntries(
        codes.map(code => [recoveryCodeHash(code), true])
      ),
      recovery_codes_generated_at: new Date().toISOString()
    });

    await audit(
      session.userId,
      'MFA_RECOVERY_CODES_ROTATED',
      req.requestId
    );

    return res.status(200).json({
      ok: true,
      recoveryCodes: codes,
      requestId: req.requestId
    });
  } catch (error) {
    const status = Number(error?.status) || 500;

    console.error(
      'MFA endpoint failed:',
      'requestId=' + req.requestId,
      error?.message || 'Unknown error'
    );

    return res.status(status).json({
      ok: false,
      error: status >= 500
        ? 'Unable to process MFA request.'
        : error.message,
      requestId: req.requestId
    });
  }
}