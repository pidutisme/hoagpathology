import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
import { firebaseDb } from '../lib/firebase-admin.js';
import { normalizeUserId, normalizePassword, buildPasswordHash, verifyPassword } from '../lib/auth.js';

const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version || '2.1.4';
const TZ = 'Asia/Kuala_Lumpur';
const USERS = 'labapp/auth/users';
const SESSIONS = 'labapp/auth/sessions';
const CHAT = 'labapp/liveChat/messages';
const NOTES = 'labapp/notes/items';
const NOTES_STATE = 'labapp/notes/userState';
const ROSTER = 'labapp/roster/team';
const LOGS = 'labapp/systemLogs';
const SETTINGS = 'labapp/settings';
const iso = () => new Date().toISOString();
const clean = (v, max=3000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0,max);
const tokenHash = token => createHash('sha256').update(`token\n${String(token || '')}`, 'utf8').digest('hex');
const asList = value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
const fail = message => { throw new Error(message); };

async function readUsers(db) {
  const snap = await db.ref(USERS).get(); const value = snap.val();
  const rows = Array.isArray(value?.users) ? value.users : asList(value?.users || value);
  return rows.filter(x => x && typeof x === 'object' && (x.userId || x.id || x.username));
}
async function writeUsers(db, users) {
  const old = (await db.ref(USERS).get()).val() || {};
  await db.ref(USERS).set({ ...((old && !Array.isArray(old) && typeof old === 'object') ? old : {}), version: 3, updatedAt: iso(), users });
}
async function sessionFor(db, token) {
  token = clean(token, 300);
  if (!token) return null;
  const snap = await db.ref(`${SESSIONS}/${tokenHash(token)}`).get();
  const session = snap.val();
  if (!session || !session.userId || Date.parse(session.expiresAt) <= Date.now()) return null;
  const users = await readUsers(db);
  const user = users.find(u => normalizeUserId(u.userId || u.id || u.username) === normalizeUserId(session.userId) && u.deleted !== true);
  if (!user || user.active === false || (Date.parse(user.sessionsRevokedAt || '') >= Date.parse(session.issuedAt || '9999-01-01'))) return null;
  const settings = (await db.ref(SETTINGS).get()).val() || {};
  if (settings.maintenance?.enabled && normalizeUserId(user.role) !== 'ADMIN') return null;
  return { token, session, user, userId: normalizeUserId(session.userId), role: normalizeUserId(user.role || session.role || 'USER') };
}
async function requireSession(db, token) { const s = await sessionFor(db, token); if (!s) fail('Your secure session has expired. Please sign in again.'); return s; }
async function requireAdmin(db, token) { const s = await requireSession(db, token); if (s.role !== 'ADMIN') fail('Administrator access is required.'); return s; }
async function log(db, userId, action, detail='', clientInfo={}) {
  try {
    const ref = db.ref(LOGS);
    const value = (await ref.get()).val() || {};
    const rows = Array.isArray(value.logs) ? value.logs : [];
    const info = clientInfo && typeof clientInfo === 'object' ? clientInfo : {};
    const actor = normalizeUserId(userId) || 'SYSTEM';
    const details = clean(detail || info.details || '', 1000);
    // The Admin UI consumes the legacy Code.gs schema: actor/details/deviceType/etc.
    // Keep userId/detail aliases as well for any clients already using the newer schema.
    rows.push({
      id: randomUUID(), at: iso(), actor, userId: actor,
      action: clean(action, 60).toUpperCase(), details, detail: details,
      deviceType: clean(info.deviceType, 40),
      deviceLabel: clean(info.deviceLabel, 80),
      appMode: clean(info.appMode, 80),
      browser: clean(info.browser, 80), os: clean(info.os, 80),
      platform: clean(info.platform, 40), screen: clean(info.screen, 40),
      language: clean(info.language, 40), online: clean(info.online, 20),
      visibility: clean(info.visibility, 20), runtimeMode: clean(info.runtimeMode, 80),
      page: clean(info.page, 80), path: clean(info.path, 300),
      userAgent: clean(info.userAgent, 500),
      extra: info.extra && typeof info.extra === 'object' ? info.extra : {}
    });
    await ref.set({ version: 2, updatedAt: iso(), logs: rows.slice(-250) });
  } catch (e) {
    console.warn('Audit log write skipped:', e?.message);
  }
}
async function chatEnvelope(db, auth) {
  const all=asList((await db.ref(CHAT).get()).val());
  const messages=all.filter(m=>m && (!m.chatType || m.chatType!=='direct' || (Array.isArray(m.participantIds)&&m.participantIds.includes(auth.userId)) || auth.role==='ADMIN')).slice(-100);
  const settings=(await db.ref(SETTINGS).get()).val()||{};
  return {ok:true,messages,count:messages.length,updatedAt:iso(),user:{id:auth.userId,key:auth.userId,name:clean(auth.user.displayName||auth.session.name||auth.userId,80),role:auth.role,email:''},users:(await readUsers(db)).filter(u=>u.active!==false&&u.deleted!==true).map(u=>({id:normalizeUserId(u.userId||u.id),name:clean(u.displayName||u.userId,80),role:clean(u.role,30)})),chatControl:settings.chatControl||{locked:false},version:VERSION};
}
async function notesEnvelope(db, auth, extra={}) {
  const notes=asList((await db.ref(NOTES).get()).val()).slice(0,50);
  const state=(await db.ref(`${NOTES_STATE}/${auth.userId}`).get()).val()||{};
  return {ok:true,notes,count:notes.length,updatedAt:iso(),readAt:state.readAt||'',savedUnreadNoteIds:Array.isArray(state.savedUnreadNoteIds)?state.savedUnreadNoteIds:[],version:VERSION,...extra};
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Pragma','no-cache'); res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed'});}
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const action=clean(body.action,80); const payload=body.payload&&typeof body.payload==='object'?body.payload:{};
  try {
    const db=firebaseDb();
    if(action==='dashboard'||action==='getDashboardData'){
      const now=new Date(); const parts=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).formatToParts(now); const get=t=>parts.find(p=>p.type===t)?.value||'';
      return res.status(200).json({ok:true,appName:'LabApp',boardTitle:'HOAG PATHOLOGY',subtitle:'SPA Single Page Application',version:VERSION,serverDate:`${get('day')} ${get('month')} ${get('year')}`,serverTime:`${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`,serverIso:now.toISOString(),timeZone:TZ});
    }
    if(action==='action') return res.status(200).json(await dispatch(db,clean(payload.method,100),Array.isArray(payload.args)?payload.args:[]));
    if(action==='login') return res.status(200).json(await login(db,payload.username,payload.password,payload.clientInfo));
    if(action==='loginState') return res.status(200).json(await loginState(db,payload.token));
    if(action==='logout') {
      const token = clean(payload.token, 300);
      if (token) {
        const auth = await sessionFor(db, token);
        if (auth) await log(db, auth.userId, 'LOGOUT', 'Signed out safely.', payload.clientInfo || {});
        await db.ref(`${SESSIONS}/${tokenHash(token)}`).remove();
      }
      return res.status(200).json({ok:true,authenticated:false,version:VERSION});
    }
    return res.status(400).json({ok:false,error:`Unknown API action: ${action}`});
  } catch(error) { console.error('Vercel API action failed:',action,error?.message||error); return res.status(200).json({ok:false,error:clean(error?.message||'Unable to process request',300),version:VERSION}); }
}

async function login(db, username, password, clientInfo={}) {
  const id=normalizeUserId(username), pass=normalizePassword(password);
  if(!id||!pass) return {ok:false,authenticated:false,error:'Please enter your username and password.'};
  const settings=(await db.ref(SETTINGS).get()).val()||{};
  const failed=(settings.loginFailures||{})[id]||{};
  if(Number(failed.until||0)>Date.now()) return {ok:false,authenticated:false,error:'Too many failed attempts. Please try again in a few minutes.'};
  const users=await readUsers(db); const user=users.find(u=>normalizeUserId(u.userId||u.id||u.username)===id&&u.deleted!==true);
  if(!user||user.active===false||!verifyPassword(user,pass)) {
    const count=Number(failed.count||0)+1; await db.ref(`${SETTINGS}/loginFailures/${id}`).set({count,until:count>=5?Date.now()+300000:0});
    return {ok:false,authenticated:false,error:'Invalid username or password.'};
  }
  if(settings.maintenance?.enabled&&normalizeUserId(user.role)!=='ADMIN') return {ok:false,authenticated:false,error:clean(settings.maintenance.message||'System is temporarily under maintenance.',300)};
  await db.ref(`${SETTINGS}/loginFailures/${id}`).remove();
  const now=Date.now(), token=`${randomUUID()}.${randomUUID()}.${now}`, issuedAt=new Date(now).toISOString(), expiresAt=new Date(now+21600000).toISOString();
  const session={userId:id,name:clean(user.displayName||id,80),role:clean(user.role||'USER',30),issuedAt,expiresAt};
  await db.ref(`${SESSIONS}/${tokenHash(token)}`).set(session); await log(db,id,'LOGIN','Signed in successfully.',clientInfo);
  return {ok:true,authenticated:true,token,expiresAt,expiresIn:21600,user:{id,name:session.name,role:session.role},version:VERSION};
}
async function loginState(db, token) { const auth=await sessionFor(db,token); if(!auth)return {ok:true,authenticated:false,version:VERSION}; return {ok:true,authenticated:true,user:{id:auth.userId,name:clean(auth.user.displayName||auth.session.name||auth.userId),role:auth.role},expiresAt:auth.session.expiresAt,version:VERSION}; }

async function dispatch(db, method, a) {
  const tokenAt = i => a[i];
  switch(method) {
    case 'getDashboardData': return (await handlerDashboard());
    case 'recordSuccessfulLogin': {const s=await requireSession(db,tokenAt(0));await log(db,s.userId,'LOGIN','Signed in successfully.',a[1]);return {ok:true,authenticated:true,version:VERSION};}
    case 'logClientActivity': {const s=await requireSession(db,tokenAt(0));await log(db,s.userId,a[1],a[2],a[3]);return {ok:true,version:VERSION};}
    case 'getFirebaseCustomToken': {const s=await requireSession(db,tokenAt(0)); const uid=`labapp_${s.userId.toLowerCase().replace(/[^a-z0-9_-]/g,'_')}`; const app=getApps().find(x=>x.name==='hoagpathology')||getApps()[0]; if(!app) throw Error('Firebase Admin app is not initialized.'); const firebaseToken=await getAuth(app).createCustomToken(s.userId,{labUserId:s.userId,role:s.role}); return {ok:true,firebaseToken,version:VERSION};}
    case 'getSystemNotice': {const s=await requireSession(db,tokenAt(0)); const settings=(await db.ref(SETTINGS).get()).val()||{};return {ok:true,authenticated:true,broadcast:settings.broadcast||{enabled:false,message:''},maintenance:settings.maintenance||{enabled:false,message:''},version:VERSION};}
    case 'getMalaysiaHolidayData': {const year=Number(a[0]||new Date().getFullYear());const r=await fetch(`https://malaysia-holiday.dydxsoft.my/api/v1/holidays?year=${year}`,{headers:{Accept:'application/json'}});if(!r.ok)throw Error('Malaysia holiday source unavailable.');const d=await r.json();return {ok:true,year,holidays:Array.isArray(d)?d:(d.holidays||d.data||[]),sourceName:'Malaysia Holiday API',fromCache:false,version:VERSION};}
    case 'getUserRosterEnvelope': {const s=await requireSession(db,tokenAt(0));const v=(await db.ref(ROSTER).get()).val()||{};const roster=v.roster||v.data||v;return {ok:true,roster,userId:s.userId,scope:'team',savedKeys:Object.keys(roster).length,updatedAt:v.updatedAt||'',source:'firebase-team',version:VERSION};}
    case 'saveUserRoster': {const s=await requireSession(db,tokenAt(1));const roster=a[0]&&typeof a[0]==='object'?a[0]:{};const old=(await db.ref(ROSTER).get()).val()||{};const updatedAt=clean(old.updatedAt);if(clean(a[2])!==updatedAt)return {ok:false,conflict:true,roster:old.roster||old.data||old,updatedAt,error:'Roster was changed by another user. The latest roster has been reloaded; please review and save again.',version:VERSION};const next={version:2,scope:'team',updatedBy:s.userId,savedKeys:Object.keys(roster).length,updatedAt:iso(),roster};await db.ref(ROSTER).set(next);return {ok:true,userId:s.userId,scope:'team',savedKeys:Object.keys(roster).length,updatedAt:next.updatedAt,storageSource:'firebase',version:VERSION};}
    case 'clearUserRoster': {const s=await requireAdmin(db,tokenAt(0));await db.ref(ROSTER).remove();await log(db,s.userId,'CLEAR_ROSTER','Cleared the shared team roster.',a[1]);return {ok:true,cleared:true,userId:s.userId,scope:'team',version:VERSION};}
    case 'getLiveChatMessages': {const s=await requireSession(db,tokenAt(0));return await chatEnvelope(db,s);}
    case 'sendLiveChatMessage': {const s=await requireSession(db,tokenAt(1));const settings=(await db.ref(SETTINGS).get()).val()||{};if(settings.chatControl?.locked&&s.role!=='ADMIN')throw Error('Live chat is locked by admin.');const text=clean(a[0],400);if(!text)throw Error('Message is empty.');const chatId=clean(a[3]||'global',100);const recipient=normalizeUserId(a[4]);const participants=chatId.startsWith('dm:')?[s.userId,recipient].filter(Boolean):[];const msg={id:randomUUID(),chatId,chatType:chatId.startsWith('dm:')?'direct':'global',participantIds:participants,recipientId:recipient,text,senderName:clean(s.user.displayName||s.userId,80),senderEmail:'',senderKey:s.userId,createdAt:iso(),updatedAt:iso(),displayTime:new Intl.DateTimeFormat('en-MY',{timeZone:TZ,dateStyle:'medium',timeStyle:'short'}).format(new Date()),replyTo:null,reactions:{},deletedAt:'',deletedBy:'',readBy:[]};const ref=db.ref(CHAT);const rows=asList((await ref.get()).val());rows.push(msg);await ref.set(Object.fromEntries(rows.slice(-100).map(x=>[x.id,x])));await log(db,s.userId,chatId.startsWith('dm:')?'CHAT_DM_SEND':'CHAT_SEND','Sent chat message.',a[2]);return await chatEnvelope(db,s);}
    case 'deleteLiveChatMessage': {const s=await requireSession(db,tokenAt(1));const ref=db.ref(CHAT), rows=asList((await ref.get()).val());const msg=rows.find(x=>x.id===a[0]);if(!msg)throw Error('Message was not found.');if(msg.senderKey!==s.userId&&s.role!=='ADMIN')throw Error('Only the sender or an Administrator can delete this message.');await ref.child(msg.id).remove();return await chatEnvelope(db,s);}
    case 'markLiveChatRead': {const s=await requireSession(db,tokenAt(1));const chatId=clean(a[0]||'global',100);const ref=db.ref(CHAT), rows=asList((await ref.get()).val());const updated=rows.map(m=>m.chatId===chatId?{...m,readBy:Array.from(new Set([...(m.readBy||[]),s.userId]))}:m);await ref.set(Object.fromEntries(updated.map(x=>[x.id,x])));return await chatEnvelope(db,s);}
    case 'reactLiveChatMessage': {const s=await requireSession(db,tokenAt(2));const ref=db.ref(CHAT),rows=asList((await ref.get()).val());const id=clean(a[0],100),emoji=clean(a[1],16);let found=false;const next=rows.map(m=>{if(m.id!==id)return m;found=true;const r={...(m.reactions||{})};const users=Array.isArray(r[emoji])?r[emoji]:[];r[emoji]=users.includes(s.userId)?users.filter(x=>x!==s.userId):[...users,s.userId];return {...m,reactions:r,updatedAt:iso()};});if(!found)throw Error('Message was not found.');await ref.set(Object.fromEntries(next.map(x=>[x.id,x])));return await chatEnvelope(db,s);}
    case 'getUserNotes': {const s=await requireSession(db,tokenAt(0));return await notesEnvelope(db,s);}
    case 'saveUserNote': {const s=await requireSession(db,tokenAt(2));const title=clean(a[0],100)||'Untitled note',text=clean(a[1],3000);if(!text&&!title)throw Error('Note title or note body is required.');const ref=db.ref(NOTES),rows=asList((await ref.get()).val());const note={id:randomUUID(),title,text,preview:text.slice(0,180),createdAt:iso(),updatedAt:iso(),displayTime:new Intl.DateTimeFormat('en-MY',{timeZone:TZ,dateStyle:'medium',timeStyle:'short'}).format(new Date()),savedByUserId:s.userId,savedByName:clean(s.user.displayName||s.userId,80),savedByRole:s.role,reactions:{}};rows.unshift(note);await ref.set(Object.fromEntries(rows.slice(0,50).map(x=>[x.id,x])));await db.ref(`${NOTES_STATE}/${s.userId}`).update({readAt:note.updatedAt,savedUnreadNoteIds:[]});return await notesEnvelope(db,s,{note,updatedAt:note.updatedAt});}
    case 'updateUserNote': {const s=await requireSession(db,tokenAt(3));const ref=db.ref(NOTES),rows=asList((await ref.get()).val());let found;const next=rows.map(n=>{if(n.id!==a[0])return n;if(n.savedByUserId!==s.userId&&s.role!=='ADMIN')throw Error('You cannot edit this note.');found={...n,title:clean(a[1],100)||'Untitled note',text:clean(a[2],3000),preview:clean(a[2],3000).slice(0,180),updatedAt:iso()};return found;});if(!found)throw Error('Note was not found.');await ref.set(Object.fromEntries(next.map(x=>[x.id,x])));return await notesEnvelope(db,s,{note:found});}
    case 'deleteUserNote': {const s=await requireSession(db,tokenAt(1));const ref=db.ref(NOTES),rows=asList((await ref.get()).val());const n=rows.find(x=>x.id===a[0]);if(!n)throw Error('Note was not found.');if(n.savedByUserId!==s.userId&&s.role!=='ADMIN')throw Error('You cannot delete this note.');await ref.child(n.id).remove();return await notesEnvelope(db,s,{deletedId:n.id});}
    case 'reactUserNote': {const s=await requireSession(db,tokenAt(2));const ref=db.ref(NOTES),rows=asList((await ref.get()).val());let found=false;const next=rows.map(n=>{if(n.id!==a[0])return n;found=true;const r={...(n.reactions||{})},emoji=clean(a[1],16),users=Array.isArray(r[emoji])?r[emoji]:[];r[emoji]=users.includes(s.userId)?users.filter(x=>x!==s.userId):[...users,s.userId];return {...n,reactions:r,updatedAt:iso()};});if(!found)throw Error('Note was not found.');await ref.set(Object.fromEntries(next.map(x=>[x.id,x])));return await notesEnvelope(db,s);}
    case 'markUserNotesRead': {const s=await requireSession(db,tokenAt(1));const readAt=clean(a[0],80)||iso();await db.ref(`${NOTES_STATE}/${s.userId}`).update({readAt});return await notesEnvelope(db,s,{readAt});}
    case 'markUserSavedNoteOpened': {const s=await requireSession(db,tokenAt(1));const stateRef=db.ref(`${NOTES_STATE}/${s.userId}`);const state=(await stateRef.get()).val()||{};const ids=Array.isArray(state.savedUnreadNoteIds)?state.savedUnreadNoteIds:[];await stateRef.update({savedUnreadNoteIds:ids.filter(x=>x!==a[0]),lastOpenedNoteId:clean(a[0],100)});return await notesEnvelope(db,s);}
    case 'getAdminControlData': {
      const s = await requireAdmin(db, tokenAt(0));
      const users = await readUsers(db);
      const settings = (await db.ref(SETTINGS).get()).val() || {};
      const logs = asList((await db.ref(LOGS).get()).val()?.logs).map(row => {
        row = row && typeof row === 'object' ? row : {};
        return {
          ...row,
          actor: clean(row.actor || row.userId || 'SYSTEM', 60),
          details: clean(row.details || row.detail || '', 1000),
          deviceType: clean(row.deviceType || '', 40),
          deviceLabel: clean(row.deviceLabel || '', 80),
          appMode: clean(row.appMode || '', 80),
          browser: clean(row.browser || '', 80),
          os: clean(row.os || '', 80),
          platform: clean(row.platform || '', 40),
          screen: clean(row.screen || '', 40),
          language: clean(row.language || '', 40),
          online: clean(row.online || '', 20),
          visibility: clean(row.visibility || '', 20),
          runtimeMode: clean(row.runtimeMode || '', 80),
          page: clean(row.page || '', 80),
          path: clean(row.path || '', 300),
          userAgent: clean(row.userAgent || '', 500)
        };
      }).filter(row => row.at && row.action).slice(-250).reverse();
      return {ok:true,isAdmin:true,users:users.map(u=>({id:normalizeUserId(u.userId||u.id),name:clean(u.displayName||u.userId,80),role:clean(u.role,30),active:u.active!==false,deleted:u.deleted===true})),broadcast:settings.broadcast||{enabled:false,message:''},maintenance:settings.maintenance||{enabled:false,message:''},chatControl:settings.chatControl||{locked:false},logs,version:VERSION,admin:{id:s.userId,name:clean(s.user.displayName||s.userId),role:s.role}};
    }
    case 'adminAddAuthUser': {const s=await requireAdmin(db,tokenAt(0));const id=normalizeUserId(a[1]), name=clean(a[2],80), role=normalizeUserId(a[3])==='ADMIN'?'ADMIN':'USER', pass=normalizePassword(a[4]);if(!id||pass.length<4)throw Error('Username and password (minimum 4 characters) are required.');const users=await readUsers(db);if(users.some(u=>normalizeUserId(u.userId||u.id)===id))throw Error('User already exists.');const salt=randomUUID()+randomUUID();users.push({userId:id,displayName:name||id,role,salt,passwordHash:buildPasswordHash(salt,pass,10000),passwordIterations:10000,active:true,createdAt:iso()});await writeUsers(db,users);await log(db,s.userId,'ADMIN_ADD_USER',`Added user ${id}.`,a[5]);return {ok:true,version:VERSION};}
    case 'adminResetAuthPassword': {const s=await requireAdmin(db,tokenAt(0));const id=normalizeUserId(a[1]),pass=normalizePassword(a[2]);if(pass.length<4)throw Error('Password must be at least 4 characters.');let changed=false;const users=(await readUsers(db)).map(u=>{if(normalizeUserId(u.userId||u.id)!==id)return u;changed=true;const salt=randomUUID()+randomUUID();return {...u,salt,passwordHash:buildPasswordHash(salt,pass,10000),passwordIterations:10000,sessionsRevokedAt:iso(),updatedAt:iso()};});if(!changed)throw Error('User was not found.');await writeUsers(db,users);await log(db,s.userId,'ADMIN_RESET_PASSWORD',`Reset password for ${id}.`,a[3]);return {ok:true,version:VERSION};}
    case 'adminSetAuthUserActive': {const s=await requireAdmin(db,tokenAt(0));const id=normalizeUserId(a[1]);let changed=false;const users=(await readUsers(db)).map(u=>{if(normalizeUserId(u.userId||u.id)!==id)return u;changed=true;return {...u,active:!!a[2],sessionsRevokedAt:a[2]?u.sessionsRevokedAt:iso(),updatedAt:iso()};});if(!changed)throw Error('User was not found.');await writeUsers(db,users);await log(db,s.userId,'ADMIN_SET_USER_ACTIVE',`${id}: ${!!a[2]}`,a[3]);return {ok:true,version:VERSION};}
    case 'adminDeleteAuthUser': {const s=await requireAdmin(db,tokenAt(0));const id=normalizeUserId(a[1]);let changed=false;const users=(await readUsers(db)).map(u=>{if(normalizeUserId(u.userId||u.id)!==id)return u;changed=true;return {...u,deleted:true,active:false,sessionsRevokedAt:iso(),updatedAt:iso()};});if(!changed)throw Error('User was not found.');await writeUsers(db,users);await log(db,s.userId,'ADMIN_DELETE_USER',`Deleted user ${id}.`,a[2]);return {ok:true,version:VERSION};}
    case 'adminSaveBroadcast': {const s=await requireAdmin(db,tokenAt(0));const message=clean(a[1],600);await db.ref(`${SETTINGS}/broadcast`).set({enabled:!!message,message,updatedAt:iso(),updatedBy:s.userId});await log(db,s.userId,'ADMIN_BROADCAST','Updated broadcast.',a[2]);return {ok:true,version:VERSION};}
    case 'adminSetMaintenanceMode': {const s=await requireAdmin(db,tokenAt(0));await db.ref(`${SETTINGS}/maintenance`).set({enabled:!!a[1],message:clean(a[2],300)||'System is temporarily under maintenance.',updatedAt:iso(),updatedBy:s.userId});await log(db,s.userId,'ADMIN_MAINTENANCE',`Maintenance ${!!a[1]}`,a[3]);return {ok:true,version:VERSION};}
    case 'adminSetLiveChatLocked': {const s=await requireAdmin(db,tokenAt(0));await db.ref(`${SETTINGS}/chatControl`).set({locked:!!a[1],updatedAt:iso(),updatedBy:s.userId});await log(db,s.userId,'ADMIN_CHAT_LOCK',`Locked ${!!a[1]}`,a[2]);return {ok:true,version:VERSION};}
    case 'adminClearLiveChat': {const s=await requireAdmin(db,tokenAt(0));await db.ref(CHAT).remove();await log(db,s.userId,'ADMIN_CLEAR_CHAT','Cleared live chat.',a[1]);return {ok:true,version:VERSION};}
    case 'adminClearUserNotes': {const s=await requireAdmin(db,tokenAt(0));await db.ref(NOTES).remove();await log(db,s.userId,'ADMIN_CLEAR_NOTES','Cleared notes.',a[1]);return {ok:true,version:VERSION};}
    case 'changeAuthPassword': {const id=normalizeUserId(a[0]),current=normalizePassword(a[1]),nextPass=normalizePassword(a[2]);const users=await readUsers(db);const u=users.find(x=>normalizeUserId(x.userId||x.id)===id&&x.deleted!==true);if(!u||!verifyPassword(u,current))return {ok:false,error:'Invalid username or current password.'};if(nextPass.length<4)return {ok:false,error:'New password must be at least 4 characters.'};const salt=randomUUID()+randomUUID(),now=iso();const updated=users.map(x=>normalizeUserId(x.userId||x.id)===id?{...x,salt,passwordHash:buildPasswordHash(salt,nextPass,10000),passwordIterations:10000,sessionsRevokedAt:now,updatedAt:now}:x);await writeUsers(db,updated);const loginResult=await login(db,id,nextPass,a[3]);return {...loginResult,changed:true,message:'Password updated successfully.'};}
    default: throw Error(`API action not migrated yet: ${method}`);
  }
}
async function handlerDashboard(){const now=new Date();const parts=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).formatToParts(now);const get=t=>parts.find(p=>p.type===t)?.value||'';return {ok:true,appName:'LabApp',boardTitle:'HOAG PATHOLOGY',subtitle:'SPA Single Page Application',version:VERSION,serverDate:`${get('day')} ${get('month')} ${get('year')}`,serverTime:`${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`,serverIso:now.toISOString(),timeZone:TZ};}
