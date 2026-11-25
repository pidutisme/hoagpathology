import { createRequire } from 'node:module';
import { supabase } from '../lib/supabase-admin.js';
import { sessionFor, clearSessionCache, tokenHash, VISITOR_PAGE_CATALOG } from '../lib/session.js';
import {
  isSameOriginRequest,
  ensureRequestId,
  cookieValue,
  isHttpsRequest,
  SESSION_COOKIE_NAME,
  clearSessionCookie
} from '../lib/request-security.js';
import { parseRequest } from '../lib/schemas/common.js';
import { loginStateRequestSchema } from '../lib/schemas/api.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  ensureRequestId(req, res);
  const isHttps = isHttpsRequest(req);

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
      req.body || {}
    );

    const token = cookieValue(
      req,
      SESSION_COOKIE_NAME
    ).slice(0, 300);

    if (body.freshSession === true && token) {
      const existing = await sessionFor(null, token);
      if (existing) {
        clearSessionCache(existing.userId);
      }

      const hash = tokenHash(token);

      const { error } = await supabase
        .from('app_sessions')
        .delete()
        .eq('token_hash', hash);

      if (error) throw error;

      clearSessionCookie(res, isHttps);

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
      clearSessionCookie(res, isHttps);

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
        role: session.role,
        pageAccess: session.pageAccess,
        visitorPageCatalog: session.role === 'VISITOR' ? VISITOR_PAGE_CATALOG : null
      },
      pageAccess: session.pageAccess,
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