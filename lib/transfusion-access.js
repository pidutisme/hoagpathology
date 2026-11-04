import { hasPermission } from './permissions.js';

function canAccess(session, record, ownPermission, allPermission) {
  if (!session?.userId || !record || record.deletedAt) return false;
  if (hasPermission(session, allPermission)) return true;
  return record.createdBy === session.userId && hasPermission(session, ownPermission);
}

export function canReadLegacyTransfusionRecord(session, record) {
  if (!session?.userId || !record || record.deletedAt) return false;
  // Legacy records without ownership metadata remain readable so a read never
  // changes ownership. They are deliberately not writable by non-admin users.
  return !String(record.createdBy || '').trim() && hasPermission(session, 'transfusion.read.own');
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
