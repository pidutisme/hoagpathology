import { z } from 'zod';

export const identifierSchema = z.string().trim().min(1).max(120)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  .refine(value => !['__proto__', 'prototype', 'constructor'].includes(value.toLowerCase()));

export const boundedText = (max, { min = 0 } = {}) => z.string().trim().min(min).max(max)
  .refine(value => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value));

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, 'Expected a valid calendar date');

export function parseRequest(schema, value) {
  assertSafePayload(value);
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
  }
  if (typeof serialized !== 'string' || Buffer.byteLength(serialized, 'utf8') > 1024 * 1024) {
    throw Object.assign(new Error('Request body is too large.'), { status: 413 });
  }
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const error = new Error('Invalid request payload.');
  error.status = 400;
  error.validationIssues = result.error.issues.map(issue => ({ path: issue.path.join('.'), code: issue.code }));
  throw error;
}

export function assertSafePayload(value) {
  let nodes = 0;
  function visit(item, depth) {
    nodes += 1;
    if (nodes > 20000 || depth > 16) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
    if (item === null || typeof item === 'boolean') return;
    if (typeof item === 'string') {
      if (item.length > 10000) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
      return;
    }
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
      return;
    }
    if (Array.isArray(item)) {
      if (item.length > 1000) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
      for (const child of item) visit(child, depth + 1);
      return;
    }
    if (typeof item === 'object') {
      const prototype = Object.getPrototypeOf(item);
      if (prototype !== Object.prototype && prototype !== null) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
      const entries = Object.entries(item);
      if (entries.length > 256) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
      for (const [key, child] of entries) {
        if (['__proto__', 'prototype', 'constructor'].includes(key.toLowerCase())) throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
        visit(child, depth + 1);
      }
      return;
    }
    throw Object.assign(new Error('Invalid request payload.'), { status: 400 });
  }
  visit(value, 0);
  return value;
}
