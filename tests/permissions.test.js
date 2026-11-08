import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, permissionsForRole, requirePermission } from '../lib/permissions.js';

const user = { userId: 'USER-1', role: 'USER' };
const admin = { userId: 'ADMIN-1', role: 'ADMIN' };
const visitor = { userId: 'VISITOR-1', role: 'VISITOR' };

test('visitor is strictly read-only', () => {
  assert.equal(hasPermission(visitor, 'roster.read'), true);
  assert.equal(hasPermission(visitor, 'inventory.read'), true);
  assert.equal(hasPermission(visitor, 'outsource.read'), true);
  assert.equal(hasPermission(visitor, 'transfusion.read.all'), true);
  assert.equal(hasPermission(visitor, 'roster.write'), false);
  assert.equal(hasPermission(visitor, 'inventory.movement.create'), false);
  assert.equal(hasPermission(visitor, 'outsource.create'), false);
  assert.equal(hasPermission(visitor, 'outsource.delete.own'), false);
  assert.equal(hasPermission(visitor, 'transfusion.create'), false);
  assert.equal(hasPermission(visitor, 'transfusion.update.own'), false);
  assert.equal(hasPermission(visitor, 'transfusion.delete.own'), false);
});

test('inventory and outsource permissions follow the documented role matrix', () => {
  assert.equal(hasPermission(user, 'inventory.read'), true);
  assert.equal(hasPermission(user, 'inventory.movement.create'), true);
  assert.equal(hasPermission(user, 'inventory.item.update'), false);
  assert.equal(hasPermission(user, 'inventory.audit.read'), false);
  assert.equal(hasPermission(user, 'outsource.create'), true);
  assert.equal(hasPermission(user, 'outsource.update'), false);
  assert.equal(hasPermission(user, 'outsource.delete.own'), true);
  assert.equal(hasPermission(admin, 'outsource.delete.own'), false);
  assert.equal(hasPermission(admin, 'inventory.item.update'), true);
  assert.equal(hasPermission(admin, 'inventory.audit.read'), true);
  assert.equal(hasPermission(admin, 'outsource.delete'), true);
});

test('transfusion permissions are additionally constrained to record ownership', async () => {
  const { canReadTransfusionRecord, canWriteTransfusionRecord, canDeleteTransfusionRecord } = await import('../lib/transfusion-access.js');
  const own = { createdBy: 'USER-1' };
  const other = { createdBy: 'USER-2' };
  assert.equal(canReadTransfusionRecord(user, own), true);
  assert.equal(canReadTransfusionRecord(user, other), false);
  assert.equal(canWriteTransfusionRecord(user, own), true);
  assert.equal(canDeleteTransfusionRecord(user, own), true);
  assert.equal(canWriteTransfusionRecord(user, other), false);
  assert.equal(canDeleteTransfusionRecord(user, other), false);
  assert.equal(canReadTransfusionRecord(admin, other), true);
  assert.equal(canWriteTransfusionRecord(admin, other), true);
  assert.equal(canDeleteTransfusionRecord(admin, other), true);
});

test('unknown roles and unauthenticated sessions fail closed', () => {
  assert.equal(hasPermission({ userId: 'X', role: 'OWNER' }, 'inventory.read'), false);
  assert.equal(hasPermission(null, 'inventory.read'), false);
  assert.throws(() => requirePermission(user, 'admin.access'), { status: 403 });
  assert.ok(permissionsForRole('ADMIN').includes('admin.access'));
  assert.deepEqual(permissionsForRole('UNMAPPED'), []);
});