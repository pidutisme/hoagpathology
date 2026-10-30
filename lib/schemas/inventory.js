import { z } from 'zod';
import { boundedText, identifierSchema, isoDateSchema } from './common.js';

const inventoryItemSchema = z.object({
  id: identifierSchema,
  name: boundedText(300, { min: 1 }),
  category: boundedText(100, { min: 1 }),
  type: boundedText(100, { min: 1 }),
  price: z.number().finite().min(0).max(100000000),
  openingStock: z.number().int().min(0).max(100000),
  minStock: z.number().int().min(0).max(100000),
  active: z.boolean()
}).strict();

const movementSchema = z.object({
  id: identifierSchema,
  itemId: identifierSchema,
  type: z.enum(['IN', 'OUT']),
  qty: z.number().int().min(1).max(100000),
  lotNo: boundedText(120),
  expiry: isoDateSchema.or(z.literal('')),
  staff: boundedText(120),
  notes: boundedText(500),
  at: z.string().min(20).max(40).refine(value => Number.isFinite(Date.parse(value))),
  expectedVersion: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).optional()
}).strict();

export const inventoryMovementSchema = movementSchema;

export const inventoryPatchSchema = z.object({
  itemUpserts: z.array(inventoryItemSchema).max(500).default([]),
  transactionUpserts: z.array(movementSchema).max(1000).default([]),
  transactionDeletes: z.array(z.object({ id: identifierSchema, expectedVersion: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER) }).strict()).max(1000).default([])
}).strict().refine(value => value.itemUpserts.length + value.transactionUpserts.length + value.transactionDeletes.length > 0, 'At least one record operation is required');
