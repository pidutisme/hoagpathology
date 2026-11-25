import { z } from 'zod';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase-admin.js';
import { sessionFor, appendSystemLog } from '../lib/session.js';
import { normalizeUserId, normalizePassword, verifyPassword } from '../lib/auth.js';
import { isSameOriginRequest, ensureRequestId, cookieValue, SESSION_COOKIE_NAME } from '../lib/request-security.js';
import {
  throttleKeys,
  isLoginThrottled as throttled,
  recordLoginFailures as recordFailure,
  clearLoginFailures as clearFailures
} from '../lib/login-throttle.js';
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
    (normalizeUserId(user.role) === 'ADMIN' || user.is_super_admin === true) &&
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
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
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

      let secret;
      try {
        secret = decryptTotpSecret(pending.encrypted_secret);
      } catch {
        return res.status(400).json({
          ok: false,
          error: 'MFA setup is invalid or expired. Start setup again.',
          requestId: req.requestId
        });
      }
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

    const sessionToken = cookieValue(req, SESSION_COOKIE_NAME).slice(0, 300);

    const session = await sessionFor(null, sessionToken);

    if (!session || (session.role !== 'ADMIN' && session.user?.is_super_admin !== true)) {
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

    const passwordValid = Boolean(body.password) && verifyPassword(session.user || {}, normalizePassword(body.password));
    const hasFactor = Boolean(body.code || body.recoveryCode);

    if (!passwordValid || !hasFactor) {
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

    const factorVerified = body.code
      ? await consumeTotpCode(session.userId, body.code)
      : await consumeRecoveryCode(session.userId, body.recoveryCode);

    if (!factorVerified) {
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
    const nowIso = new Date().toISOString();

    const { error: rotateError } = await supabase
      .from('user_mfa')
      .update({
        recovery_hashes: Object.fromEntries(
          codes.map(code => [recoveryCodeHash(code), true])
        ),
        recovery_codes_generated_at: nowIso,
        updated_at: nowIso
      })
      .eq('user_id', session.userId);

    if (rotateError) throw rotateError;

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