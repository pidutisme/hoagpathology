import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { sessionFor } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { parseRequest } from '../lib/schemas/common.js';
import { loginStateRequestSchema } from '../lib/schemas/api.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version || '0.0.0';

const COOKIE_NAME = 'labapp_session';

const cookieValue = (req, name) => {
  const raw = String(req.headers?.cookie || '');
  const hit = raw
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(name + '='));

  if (!hit) return '';

  try {
    return decodeURIComponent(hit.slice(name.length + 1));
  } catch {
    return '';
  }
};

const clearSessionCookie = res =>
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

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
    const body = parseRequest(
      loginStateRequestSchema,
      req.body
    );

    const token = cookieValue(
      req,
      COOKIE_NAME
    ).slice(0, 300);

    if (body.freshSession === true && token) {
      const { supabase } = await import('../lib/supabase-admin.js');

      const hash = tokenHash(token);

      const { error } = await supabase
        .from('app_sessions')
        .delete()
        .eq('token_hash', hash);

      if (error) throw error;

      clearSessionCookie(res);

      return res.status(200).json({
        ok: true,
        authenticated: false,
        requestId: req.requestId
      });
    }

    if (!token) {
      return res.status(200).json({
        ok: true,
        authenticated: false,
        requestId: req.requestId
      });
    }

    const session = await sessionFor(null, token);

    if (!session) {
      clearSessionCookie(res);

      return res.status(200).json({
        ok: true,
        authenticated: false,
        requestId: req.requestId
      });
    }

    return res.status(200).json({
      ok: true,
      authenticated: true,
      user: {
        id: session.userId,
        name: String(
          session.user.displayName ||
          session.session.name ||
          session.userId
        ),
        role: session.role
      },
      expiresAt: session.session.expiresAt,
      version: VERSION,
      requestId: req.requestId
    });
  } catch (error) {
    const status = Number(error?.status) || 500;

    console.error(
      'Login state check failed:',
      'requestId=' + req.requestId,
      error?.message || 'Unknown error'
    );

    return res.status(status).json({
      ok: false,
      authenticated: false,
      error:
        status >= 500
          ? 'Unable to verify session.'
          : error.message,
      requestId: req.requestId
    });
  }
}