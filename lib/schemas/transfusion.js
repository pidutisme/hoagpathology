import { z } from 'zod';
import { identifierSchema, boundedText, isoDateSchema } from './common.js';

const units = ['WAD1','WAD2','WAD3','WAD4','ED','OPD','UKIA','PRIMER','VEKTOR','TB/KUSTA'];
const staff = ['NUR LIZA','JAYANTHI','SURIANI','JAPIDI','SHOUNNA','NAZRAN'];
const groups = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
const optionalUrl = z.string().max(500).refine(value => {
  if (!value) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
});

export const transfusionRecordSchema = z.object({
  id: identifierSchema,
  date: isoDateSchema,
  name: boundedText(160, { min: 1 }),
  tt: boundedText(80),
  idIc: boundedText(80),
  sex: z.enum(['','L','P','TBC']),
  age: z.string().max(12).refine(value => value === '' || value === 'NB/NO IC' || (/^\d{1,3}$/.test(value) && Number(value) <= 130)),
  unit: z.enum(['', ...units]),
  bloodGroup: z.enum(['', ...groups]),
  packNo: boundedText(240),
  staff: z.enum(['', ...staff]),
  googleDriveLink: optionalUrl,
  remarks: z.enum(['','PENDING','COMPLETED','REJECT']),
  notes: boundedText(3000)
}).strict();

export const transfusionPatchSchema = z.object({
  record: transfusionRecordSchema,
  expectedVersion: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER)
}).strict();

export const transfusionQuerySchema = z.object({
  year: z.string().regex(/^(?:ALL|20\d{2})$/).optional(),
  limit: z.string().regex(/^\d{1,3}$/).optional(),
  offset: z.string().regex(/^\d{1,7}$/).optional()
}).strict();

export const transfusionDeleteQuerySchema = z.object({
  recordId: identifierSchema,
  expectedVersion: z.string().regex(/^\d{1,12}$/)
}).strict();
