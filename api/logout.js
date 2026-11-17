import { createHash } from 'node:crypto';
import { supabase } from '../lib/supabase-admin.js';
import { sessionFor, appendSystemLog, clearSessionCache } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId, cookieValue, isHttpsRequest } from '../lib/request-security.js';
import { z } from 'zod';
import { parseRequest, assertSafePayload } from '../lib/schemas/common.js';

const bodySchema = z
  .object({
    clientInfo: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

const clearCookie = (res, secure = true) =>
  res.setHeader(
    'Set-Cookie',
    `labapp_session=; Max-Age=0; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Lax`
  );

const tokenHash = token =>
  createHash('sha256')
    .update(`token\n${String(token || '')}`, 'utf8')
    .digest('hex');

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
      error: 'Cross-origin request rejected.',
      requestId: req.requestId
    });
  }

  try {
    const body = parseRequest(
      bodySchema,
      req.body || {}
    );

    if (body.clientInfo) {
      assertSafePayload(body.clientInfo);
    }

    const token = cookieValue(req, 'labapp_session').slice(0, 300);

    if (token) {
      const session = await sessionFor(null, token);

      if (session) {
        await appendSystemLog(null, {
          at: new Date().toISOString(),
          actor: session.userId,
          actorId: session.userId,
          userId: session.userId,
          action: 'LOGOUT',
          details: 'Signed out safely.',
          result: 'SUCCESS',
          requestId: req.requestId,
          metadata: {}
        });
        await supabase.from('app_users').update({ last_logout_at: new Date().toISOString() }).eq('user_id', session.userId).then(() => {}, () => {});
        clearSessionCache(session.userId);
      }

      const { error } = await supabase
        .from('app_sessions')
        .delete()
        .eq('token_hash', tokenHash(token));

      if (error) {
        throw error;
      }
    }

    clearCookie(res, isHttps);

    return res.status(200).json({
      ok: true,
      authenticated: false,
      requestId: req.requestId
    });
  } catch (error) {
    const status =
      Number(error?.status) || 500;

    console.error(
      'Logout endpoint failed:',
      'requestId=' + req.requestId,
      error?.message || 'Unknown error'
    );

    clearCookie(res, isHttps);

    return res.status(status).json({
      ok: false,
      error:
        status >= 500
          ? 'Unable to sign out safely.'
          : error.message,
      requestId: req.requestId
    });
  }
}
