import { hasPermission } from './permissions.js';

const ALLOWED_AFB = new Set(['X1', 'X2', 'X3']);
const AFB_ORDER = { X1: 1, X2: 2, X3: 3 };
const SAMPLE_ACTIVITY_KEYS = [
  'date', 'labNo', 'barcode', 'sample', 'quality', 'result',
  'observation', 'scanty', 'slideResult', 'patientResult',
  'slide', 'releaseDate', 'tat', 'staff', 'review', 'notes'
];
const HISTORICAL_CREATORS = new Set([
  'historical csv migration',
  'csv migration'
]);

const hasOwn = (obj, key) => Boolean(obj) && Object.prototype.hasOwnProperty.call(obj, key);

export const cleanTbisText = (v, max = 3000) =>
  String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

const fail = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export function normalizeAfb(value) {
  const normalized = cleanTbisText(value, 20).toUpperCase();
  return ALLOWED_AFB.has(normalized) ? normalized : '';
}

export function findSampleByAfb(samples, targetAfb) {
  const target = normalizeAfb(targetAfb);
  if (!target || !Array.isArray(samples)) return null;
  return samples.find(sample => normalizeAfb(sample?.afb) === target) || null;
}

export function hasSampleActivity(sample) {
  if (!sample || typeof sample !== 'object') return false;
  return SAMPLE_ACTIVITY_KEYS.some(key => cleanTbisText(sample[key], 1000) !== '');
}

export function tbis102aOwnerMatches(session, record) {
  if (!session?.userId || !record || typeof record !== 'object') return false;
  const ownerKeys = [record.createdBy, record.createdByUserId, record.ownerId, record.ownerUserId]
    .map(v => String(v || '').trim().toLowerCase())
    .filter(v => v && !HISTORICAL_CREATORS.has(v));
  if (!ownerKeys.length) return false;
  const userKeys = [
    session.userId,
    session.user?.userId,
    session.user?.id,
    session.user?.username,
    session.user?.displayName,
    session.user?.name
  ]
    .map(v => String(v || '').trim().toLowerCase())
    .filter(Boolean);
  return ownerKeys.some(v => userKeys.includes(v));
}

export function requireTbis102aUpdatePermission(session, record) {
  if (!session?.userId) fail('A valid authenticated session is required.', 401);
  if (String(session.role || '').trim().toUpperCase() === 'VISITOR') {
    fail('Visitor accounts have read-only access to TBIS102A records.', 403);
  }
  if (hasPermission(session, 'tbis102a.update.all')) return session;
  if (hasPermission(session, 'tbis102a.update.own') && tbis102aOwnerMatches(session, record)) {
    return session;
  }
  fail('You are not authorized to edit TBIS102A records.', 403);
}

export function requireTbis102aDeletePermission(session, record) {
  if (!session?.userId) fail('A valid authenticated session is required.', 401);
  if (String(session.role || '').trim().toUpperCase() === 'ADMIN' && hasPermission(session, 'tbis102a.delete.all')) {
    return session;
  }
  if (!hasPermission(session, 'tbis102a.delete.own') || !tbis102aOwnerMatches(session, record)) {
    fail('You can only delete TBIS102A records created by your own account.', 403);
  }
  return session;
}

function normalizeSampleFields(incoming, prevSample, afb) {
  const pick = (key, max) => {
    if (incoming && hasOwn(incoming, key) && incoming[key] !== undefined) {
      return cleanTbisText(incoming[key], max);
    }
    if (prevSample && hasOwn(prevSample, key) && prevSample[key] !== undefined) {
      return cleanTbisText(prevSample[key], max);
    }
    return '';
  };

  const resultVal = pick('result', 40);
  const isScanty = resultVal.toUpperCase() === 'SCANTY';
  const scantyVal = isScanty ? pick('scanty', 40) : '';

  return {
    afb,
    date: pick('date', 20),
    labNo: pick('labNo', 100),
    barcode: pick('barcode', 160),
    sample: pick('sample', 40),
    quality: pick('quality', 40),
    result: resultVal,
    observation: pick('observation', 200),
    scanty: scantyVal,
    slideResult: pick('slideResult', 100),
    patientResult: pick('patientResult', 100),
    slide: pick('slide', 100),
    releaseDate: pick('releaseDate', 20),
    tat: pick('tat', 40),
    staff: pick('staff', 120),
    review: pick('review', 120),
    notes: pick('notes', 1000)
  };
}

export function normalizeTbis102aRecord(raw, existing, userId, nowIso = new Date().toISOString()) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const previous = existing && typeof existing === 'object' ? existing : null;
  const id = cleanTbisText(source.id || previous?.id, 160);
  if (!id) fail('TBIS102A record ID is required.');

  const incomingSamples = Array.isArray(source.samples) ? source.samples : [];
  if (incomingSamples.length > 3) fail('At most 3 SPUTUM AFB samples (X1, X2, X3) are allowed.');

  const previousSamples = Array.isArray(previous?.samples) ? previous.samples : [];
  const mergedByAfb = new Map();

  for (const prev of previousSamples) {
    if (!prev || typeof prev !== 'object') continue;
    const afb = normalizeAfb(prev.afb);
    if (!afb || mergedByAfb.has(afb)) continue;
    mergedByAfb.set(afb, normalizeSampleFields(null, prev, afb));
  }

  const incomingSeen = new Set();
  for (const incoming of incomingSamples) {
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      fail('Invalid SPUTUM AFB sample payload.');
    }
    const afb = normalizeAfb(incoming.afb);
    if (!afb) fail('SPUTUM AFB must be X1, X2, or X3.');
    if (incomingSeen.has(afb)) fail(`Duplicate SPUTUM AFB sample: ${afb}.`);
    incomingSeen.add(afb);

    const prevSample = mergedByAfb.get(afb) || null;
    mergedByAfb.set(afb, normalizeSampleFields(incoming, prevSample, afb));
  }

  const resultSamples = Array.from(mergedByAfb.values()).sort(
    (a, b) => (AFB_ORDER[a.afb] || 99) - (AFB_ORDER[b.afb] || 99)
  );

  const createdAt = previous?.createdAt || source.createdAt || nowIso;
  const x1Sample = findSampleByAfb(resultSamples, 'X1');
  const x1Submitted = incomingSeen.has('X1');

  const pickParent = (key, max, preferX1 = false) => {
    if (preferX1 && x1Sample && (!previous || x1Submitted)) {
      return cleanTbisText(x1Sample[key] || (hasOwn(source, key) ? source[key] : previous?.[key]), max);
    }
    if (hasOwn(source, key) && source[key] !== undefined) {
      return cleanTbisText(source[key], max);
    }
    return cleanTbisText(previous?.[key], max);
  };

  const bilValue = hasOwn(source, 'bil') && cleanTbisText(source.bil, 20)
    ? cleanTbisText(source.bil, 20)
    : cleanTbisText(previous?.bil, 20);

  const record = {
    id,
    bil: bilValue,
    date: pickParent('date', 20, true),
    labNo: pickParent('labNo', 100, true),
    barcode: pickParent('barcode', 160, true),
    name: pickParent('name', 200, false),
    idNo: pickParent('idNo', 100, false),
    unit: pickParent('unit', 120, false),
    patient: pickParent('patient', 60, false),
    samples: resultSamples,
    createdAt,
    createdBy: previous?.createdBy || source.createdBy || userId,
    updatedAt: nowIso,
    updatedBy: userId,
    version: Number(previous?.version || source.version || 0) + 1 || 1,
    deletedAt: ''
  };

  if (!record.date || !record.name) fail('Date and Name are required.');
  if (!record.samples.length || !record.samples.some(hasSampleActivity)) {
    fail('At least one SPUTUM AFB sample is required.');
  }

  for (const s of record.samples) {
    const prevSample = previous ? findSampleByAfb(previousSamples, s.afb) : null;
    const prevHadActivity = prevSample ? hasSampleActivity(prevSample) : false;
    const isNewlyPopulated = !previous || (incomingSeen.has(s.afb) && !prevHadActivity);
    const hasActivity = hasSampleActivity(s);

    if (isNewlyPopulated && hasActivity && !s.result && !s.patientResult) {
      fail(`Result is required for ${s.afb}.`);
    }
    if (s.result && s.result.toUpperCase() === 'SCANTY' && (!s.scanty || !/^[1-9]\d*$/.test(s.scanty))) {
      fail('A positive integer numeric AFB count is required when Result is SCANTY.');
    }
  }

  return record;
}
