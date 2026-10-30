
import { issueSignedToken, presignUrl } from '@vercel/blob';
import { handleUploadPresigned } from '@vercel/blob/client';
import { sessionFor } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { parseRequest } from '../lib/schemas/common.js';
import { transfusionBlobRequestSchema } from '../lib/schemas/files.js';

const cookieValue = (req, name) => { const raw=String(req.headers?.cookie||''); const hit=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'=')); if(!hit)return ''; try{return decodeURIComponent(hit.slice(name.length+1));}catch{return '';} };
const clean = (v, max=300) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0,max);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  ensureRequestId(req,res);
  if (req.method !== 'POST') {res.setHeader('Allow','POST');return res.status(405).json({ ok:false, error:'Method not allowed',requestId:req.requestId });}
  if (!isSameOriginRequest(req)) return res.status(403).json({ok:false,error:'Cross-origin request rejected.',requestId:req.requestId});
  try {
    const sessionToken = cookieValue(req, 'labapp_session');
    const session = await sessionFor(null, sessionToken);
    if (!session) throw Object.assign(new Error('Your secure session has expired. Please sign in again.'), { status: 401 });
    const body = parseRequest(transfusionBlobRequestSchema,req.body||{});
    const pathnameInput = clean(body.pathname, 500).replace(/^\/+/, '');
    const safeUser = clean(session.userId, 120).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const recordId = clean(body.recordId, 120).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const filename = clean(body.filename, 160).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const operation = body.operation || 'put';
    const maxSize = body.maxSize || 10485760;
    const pathname = pathnameInput || (recordId && filename ? `transfusion/${safeUser}/${recordId}/${Date.now()}-${filename}` : '');
    if (!pathname || !pathname.startsWith(`transfusion/${safeUser}/`)) {
      return res.status(403).json({ ok:false, error:'Invalid upload path.',requestId:req.requestId });
    }
    if (operation === 'put') {
      const contentType = clean(body.contentType, 120) || 'application/octet-stream';
      const uploadBody = {
        type: 'blob.generate-presigned-url',
        payload: {
          pathname,
          clientPayload: null,
          multipart: false,
        },
      };
      const prepared = await handleUploadPresigned({
        body: uploadBody,
        request: req,
        getSignedToken: async () => ({
          token: await issueSignedToken({
            pathname,
            operations: ['put'],
            allowedContentTypes: [contentType],
            maximumSizeInBytes: maxSize,
            validUntil: Date.now() + 15 * 60 * 1000,
          }),
          urlOptions: { access: 'private' },
        }),
      });
      return res.status(200).json({ ok:true, presignedUrlPayload:prepared.presignedUrlPayload, pathname,requestId:req.requestId });
    }

    const token = await issueSignedToken({ pathname, operations: ['get'] });
    const signed = await presignUrl(token, {
      pathname,
      operation: 'get',
      access: 'private',
      validUntil: Date.now() + 5 * 60 * 1000,
    });
    return res.status(200).json({ ok:true, url:signed.presignedUrl, pathname, expiresAt:signed.validUntil || Date.now()+5*60*1000,requestId:req.requestId });
  } catch (err) {
    const status = Number(err?.status) || 500;
    return res.status(status).json({ ok:false, error: status>=500?'Unable to prepare Blob request.':err.message,requestId:req.requestId });
  }
}
