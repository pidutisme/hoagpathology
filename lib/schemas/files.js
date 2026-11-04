import { z } from 'zod';
import { identifierSchema, boundedText } from './common.js';

export const transfusionBlobRequestSchema = z.object({
  operation: z.enum(['get', 'put']).optional(),
  pathname: z.string().max(500).regex(/^[A-Za-z0-9._/-]*$/).refine(value => !value.split('/').includes('..')).optional(),
  recordId: identifierSchema.optional(),
  filename: boundedText(160).optional(),
  maxSize: z.number().int().min(1).max(10485760).optional(),
  contentType: z.string().max(120).regex(/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/).optional()
}).strict();
