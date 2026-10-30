import fs from 'node:fs';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { get, list } from '@vercel/blob';

const prefix = 'backups/hoagpathology/';
const [pathname, outputPath] = process.argv.slice(2);
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Set BLOB_READ_WRITE_TOKEN for the backup Blob store.');

if (pathname === '--list') {
  let cursor;
  do {
    const page = await list({ prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
    for (const blob of page.blobs) console.log(`${blob.pathname}\t${blob.uploadedAt.toISOString()}\t${blob.size}`);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
} else {
  if (!pathname || !outputPath) throw new Error('Usage: node scripts/download-encrypted-backup.mjs --list OR <backup-pathname> <output-file>');
  if (!pathname.startsWith(prefix) || pathname.split('/').includes('..')) throw new Error('Only Hoag Pathology backup objects can be downloaded by this script.');
  const blob = await get(pathname, { access: 'private', useCache: false });
  if (!blob) throw new Error('Backup object was not found.');
  await pipeline(blob.stream, createWriteStream(outputPath, { flags: 'wx' }));
  console.log(`Downloaded encrypted backup to ${outputPath}`);
}
