const ROLE_PERMISSIONS = Object.freeze({
  VISITOR: new Set([
    'roster.read',
    'inventory.read',
    'outsource.read',
    'transfusion.read.all'
  ]),
  USER: new Set([
    'roster.read',
    'roster.write',
    'inventory.read',
    'inventory.movement.create',
    'outsource.read',
    'outsource.create',
    'outsource.delete.own',
    'transfusion.read.own',
    'transfusion.create',
    'transfusion.update.own',
    'transfusion.delete.own'
  ]),
  ADMIN: new Set([
    'admin.access',
    'inventory.read',
    'inventory.item.create',
    'inventory.item.update',
    'inventory.item.delete',
    'inventory.movement.create',
    'inventory.movement.reverse',
    'inventory.audit.read',
    'outsource.read',
    'outsource.create',
    'outsource.update',
    'outsource.delete',
    'transfusion.read.own',
    'transfusion.read.all',
    'transfusion.create',
    'transfusion.update.own',
    'transfusion.update.all',
    'transfusion.delete.own',
    'transfusion.delete.all'
  ])
});

export function hasPermission(session, permission) {
  if (!session?.userId || typeof permission !== 'string') return false;
  const role = String(session.role || '').trim().toUpperCase();
  return ROLE_PERMISSIONS[role]?.has(permission) === true;
}

export function requirePermission(session, permission) {
  if (!hasPermission(session, permission)) {
    const error = new Error('You are not authorized to perform this action.');
    error.status = 403;
    throw error;
  }
  return session;
}

export function permissionsForRole(role) {
  return [...(ROLE_PERMISSIONS[String(role || '').trim().toUpperCase()] || [])].sort();
}