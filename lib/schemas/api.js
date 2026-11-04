import { z } from 'zod';
import { boundedText, identifierSchema, isoDateSchema } from './common.js';

export const loginStateRequestSchema = z.object({ freshSession: z.boolean().optional() }).strict();

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9._@ -]+$/),
  password: z.string().min(1).max(200),
  clientInfo: z.record(z.string(), z.unknown()).optional(),
  mfaCode: z.string().regex(/^\d{6}$/).optional(),
  recoveryCode: z.string().regex(/^[A-Z0-9-]{8,32}$/i).optional()
}).strict();

export const bridgeRequestSchema = z.object({
  action: z.enum(['action', 'dashboard', 'getDashboardData', 'login', 'loginState', 'logout']),
  payload: z.object({
    method: boundedText(100, { min: 1 }).optional(),
    args: z.array(z.unknown()).max(20).optional(),
    token: z.string().max(300).optional(),
    clientInfo: z.record(z.string(), z.unknown()).optional(),
    username: boundedText(80, { min: 1 }).optional(),
    password: z.string().max(200).optional(),
    freshSession: z.boolean().optional(),
    mfaCode: z.string().regex(/^\d{6}$/).optional(),
    recoveryCode: z.string().regex(/^[A-Z0-9-]{8,32}$/i).optional()
  }).strict().optional()
}).strict().superRefine((request, context) => {
  const payload = request.payload || {};
  if (request.action === 'action' && !payload.method) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['payload', 'method'], message: 'Required.' });
  }
  if (request.action === 'login' && (!payload.username || !payload.password)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['payload'], message: 'Login credentials are required.' });
  }
});

export const outsourceRecordSchema = z.object({
  id: identifierSchema,
  sampleDate: isoDateSchema,
  barCode: boundedText(80),
  name: boundedText(160, { min: 1 }),
  idIc: boundedText(80),
  sex: boundedText(20),
  age: z.string().regex(/^\d{0,3}$/).refine(value => value === '' || Number(value) <= 130),
  unit: boundedText(100),
  dispatchDate: isoDateSchema.or(z.literal('')),
  referral: boundedText(120),
  lab: boundedText(120),
  test: boundedText(160, { min: 1 }),
  result: z.enum(['PENDING', 'COMPLETED', 'REJECT', 'ADA']),
  resultDate: isoDateSchema.or(z.literal('')),
  referenceNo: boundedText(100),
  rejectReason: boundedText(200),
  notes: boundedText(1000)
}).strict();

export const recordVersionSchema = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);



