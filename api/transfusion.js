import { createHash } from 'node:crypto';
import { supabase } from '../lib/supabase-admin.js';
import { sessionFor, appendSystemLog } from '../lib/session.js';
import { isSameOriginRequest, ensureRequestId } from '../lib/request-security.js';
import { parseRequest } from '../lib/schemas/common.js';
import { transfusionDeleteQuerySchema, transfusionPatchSchema, transfusionQuerySchema, transfusionRecordSchema } from '../lib/schemas/transfusion.js';
import { canReadLegacyTransfusionRecord, canReadTransfusionRecord, canWriteLegacyTransfusionRecord, canWriteTransfusionRecord } from '../lib/transfusion-access.js';

const ROOT = 'labapp/transfusion/records';
const LEGACY_INVENTORY = 'labapp/inventory';
const cookieValue = req => String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('labapp_session='))?.slice('labapp_session='.length) || '';
const tokenHash = token => createHash('sha256').update(`token\n${String(token || '')}`, 'utf8').digest('hex');
const audit = (db, actorId, action, requestId) => appendSystemLog(db,{at:new Date().toISOString(),actorId,action,details:'',result:'SUCCESS',requestId,metadata:{}});
const bodyOrEmpty = body => body && typeof body === 'object' && !Array.isArray(body) ? body : {};

async function getTransfusionRows() {
  const { data, error } = await supabase.from('transfusion_records').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    ...(row.data && typeof row.data === 'object' ? row.data : {}),
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function authorizedSession(req, res) {
  const token = decodeURIComponent(cookieValue(req)).slice(0,300);
  const session = await sessionFor(null, token);
  if (!session) res.status(401).json({ok:false,error:'Your secure session has expired. Please sign in again.',requestId:req.requestId});
  return session;
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  ensureRequestId(req,res);
  if (!['GET','POST','PATCH','DELETE'].includes(req.method)) {res.setHeader('Allow','GET, POST, PATCH, DELETE');return res.status(405).json({ok:false,error:'Method not allowed',requestId:req.requestId});}
  if (req.method !== 'GET' && !isSameOriginRequest(req)) return res.status(403).json({ok:false,error:'Cross-origin request rejected.',requestId:req.requestId});
  try {
    const session=await authorizedSession(req,res);
    if(!session)return;
    if(req.method==='GET'){
      const query=parseRequest(transfusionQuerySchema,req.query||{});
      const limit=Math.min(Number(query.limit||500),500);
      const offset=Number(query.offset||0);
      const rows=(await getTransfusionRows()).filter(row=>canReadTransfusionRecord(session,row)||canReadLegacyTransfusionRecord(session,row));
      const filtered=rows.filter(row=>!query.year||query.year==='ALL'||String(row.date||'').slice(0,4)===query.year).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
      const records=filtered.slice(offset,offset+limit);
      return res.status(200).json({ok:true,records,hasMore:offset+records.length<filtered.length,requestId:req.requestId});
    }
    if(req.method==='POST'){
      const record=parseRequest(transfusionRecordSchema,req.body);
      const now = new Date().toISOString();
const created = {
  ...record,
  createdAt: now,
  createdBy: session.userId,
  updatedAt: now,
  updatedBy: session.userId,
  version: 1,
  deletedAt: ''
};

const { data: existing } = await supabase
  .from('transfusion_records')
  .select('id')
  .eq('id', record.id)
  .maybeSingle();

if (existing) {
  return res.status(409).json({
    ok: false,
    error: 'A transfusion record with this ID already exists.',
    requestId: req.requestId
  });
}

const { error: insertError } = await supabase
  .from('transfusion_records')
  .insert({
    id: record.id,
    data: created,
    created_at: now,
    updated_at: now
  });

if (insertError) {
  if (insertError.code === '23505') {
    return res.status(409).json({
      ok: false,
      error: 'A transfusion record with this ID already exists.',
      requestId: req.requestId
    });
  }
  throw insertError;
}
      await audit(null,session.userId,'TRANSFUSION_RECORD_CREATED',req.requestId);
      return res.status(201).json({ok:true,record:created,requestId:req.requestId});
    }

    if(req.method==='PATCH'){
      const input=parseRequest(transfusionPatchSchema,req.body);
      const { data: row, error: readError } = await supabase.from('transfusion_records').select('*').eq('id',input.record.id).maybeSingle();
      if(readError)throw readError;

      const current=row?.data&&typeof row.data==='object'?row.data:null;
      if(!current)return res.status(409).json({ok:false,error:'Transfusion record changed or was not found. Reload before editing.',requestId:req.requestId});

      if(!canWriteTransfusionRecord(session,current)&&!canWriteLegacyTransfusionRecord(session,current)){
        return res.status(403).json({ok:false,error:'You cannot update this transfusion record.',requestId:req.requestId});
      }

      if(Number(current.version||1)!==input.expectedVersion){
        return res.status(409).json({ok:false,error:'Transfusion record changed or was not found. Reload before editing.',requestId:req.requestId});
      }

      const at=new Date().toISOString();
      const updated={
        ...current,
        ...input.record,
        updatedAt:at,
        updatedBy:session.userId,
        version:Math.max(Number(current.version||0)+1,2),
        deletedAt:''
      };

      const {data:updatedRow,error:updateError}=await supabase
        .from('transfusion_records')
        .update({data:updated,updated_at:at})
        .eq('id',input.record.id)
        .eq('updated_at',row.updated_at)
        .select('*')
        .maybeSingle();

      if(updateError)throw updateError;
      if(!updatedRow)return res.status(409).json({ok:false,error:'Transfusion record changed or was not found. Reload before editing.',requestId:req.requestId});

      await audit(null,session.userId,'TRANSFUSION_RECORD_UPDATED',req.requestId);
      return res.status(200).json({ok:true,record:updated,requestId:req.requestId});
    }

    if(req.method==='DELETE'){
      const query=parseRequest(transfusionDeleteQuerySchema,req.query||{});
      const {data:row,error:readError}=await supabase.from('transfusion_records').select('*').eq('id',query.recordId).maybeSingle();
      if(readError)throw readError;

      const current=row?.data&&typeof row.data==='object'?row.data:null;
      if(!current||current.deletedAt){
        return res.status(409).json({ok:false,error:'Transfusion record changed, was not found, or was already deleted.',requestId:req.requestId});
      }

      if(!canWriteTransfusionRecord(session,current)&&!canWriteLegacyTransfusionRecord(session,current)){
        return res.status(403).json({ok:false,error:'You cannot delete this transfusion record.',requestId:req.requestId});
      }

      if(Number(current.version||1)!==Number(query.expectedVersion)){
        return res.status(409).json({ok:false,error:'Transfusion record changed, was not found, or was already deleted.',requestId:req.requestId});
      }

      const at=new Date().toISOString();
      const deleted={
        ...current,
        deletedAt:at,
        deletedBy:session.userId,
        updatedAt:at,
        updatedBy:session.userId,
        version:Math.max(Number(current.version||0)+1,2)
      };

      const {data:deletedRow,error:deleteError}=await supabase
        .from('transfusion_records')
        .update({data:deleted,updated_at:at})
        .eq('id',query.recordId)
        .eq('updated_at',row.updated_at)
        .select('*')
        .maybeSingle();

      if(deleteError)throw deleteError;
      if(!deletedRow)return res.status(409).json({ok:false,error:'Transfusion record changed, was not found, or was already deleted.',requestId:req.requestId});

      await audit(null,session.userId,'TRANSFUSION_RECORD_DELETED',req.requestId);
      return res.status(200).json({ok:true,deleted:true,requestId:req.requestId});
    }
  } catch(error) {
    const status=Number(error?.status)||500;
    console.error('Transfusion API failed:','requestId='+req.requestId,error?.message||'Unknown error');
    return res.status(status).json({ok:false,error:status>=500?'Unable to process transfusion request.':error.message,requestId:req.requestId});
  }
}

