import { hasPermission } from './permissions.js';

function canAccess(session, record, ownPermission, allPermission) {
  if (!session?.userId || !record || record.deletedAt) return false;
  if (hasPermission(session, allPermission)) return true;
  return record.createdBy === session.userId && hasPermission(session, ownPermission);
}

export function canReadLegacyTransfusionRecord(session, record) {
  if (!session?.userId || !record || record.deletedAt) return false;
  // Legacy records without ownership metadata and explicitly tagged historical
  // CSV imports remain readable to users with own-record read access. Historical
  // imports are not treated as user-owned, so non-admin users cannot edit/delete them.
  const createdBy = String(record.createdBy || '').trim();
  const isLegacy = !createdBy;
  const isHistoricalImport = createdBy === 'Historical CSV Migration';
  return (isLegacy || isHistoricalImport) && hasPermission(session, 'transfusion.read.own');
}

export function canWriteLegacyTransfusionRecord(session, record) {
  if (!session?.userId || !record || record.deletedAt) return false;
  return !String(record.createdBy || '').trim() && hasPermission(session, 'transfusion.update.all');
}

export function canReadTransfusionRecord(session, record) {
  return canAccess(session, record, 'transfusion.read.own', 'transfusion.read.all');
}

export function canWriteTransfusionRecord(session, record) {
  return canAccess(session, record, 'transfusion.update.own', 'transfusion.update.all');
}

export function canDeleteTransfusionRecord(session, record) {
  return canAccess(session, record, 'transfusion.delete.own', 'transfusion.delete.all');
}
