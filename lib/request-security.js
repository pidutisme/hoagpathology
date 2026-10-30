import { randomUUID } from 'node:crypto';

const firstHeader = (req, name) => String(req.headers?.[name] || '').split(',')[0].trim();
const forwardedHost = req => (firstHeader(req, 'x-forwarded-host') || firstHeader(req, 'host')).toLowerCase();
const forwardedProto = req => (firstHeader(req, 'x-forwarded-proto') || '').toLowerCase();

export function isSameOriginRequest(req, options = {}) {
  const origin = String(req.headers?.origin || req.headers?.referer || '').trim();
  const requestHost = forwardedHost(req);
  const directHost = firstHeader(req, 'host').toLowerCase();
  if (!requestHost) return false;

  // Browsers normally send Origin on JSON POSTs. Some embedded/desktop webviews
  // omit it, so allow a same-origin request when the fetch metadata explicitly
  // identifies it as same-origin/same-site. Never accept an explicit mismatch.
  if (!origin) {
    const fetchSite = String(req.headers?.['sec-fetch-site'] || '').trim().toLowerCase();
    if (fetchSite === 'cross-site') return false;
    if (fetchSite === 'same-origin' || fetchSite === 'same-site') return true;
    return options.allowMissingOrigin === true;
  }

  try {
    const parsed = new URL(origin);
    const isHttps = parsed.protocol === 'https:';
    const isLocal = parsed.protocol === 'http:' && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestHost);
    const proxyHttps = forwardedProto(req) === 'https';
    const parsedHost = parsed.host.toLowerCase();
    return (isHttps || proxyHttps || isLocal) && (parsedHost === requestHost || (Boolean(directHost) && parsedHost === directHost));
  } catch {
    return false;
  }
}

export function ensureRequestId(req, res) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  return requestId;
}
