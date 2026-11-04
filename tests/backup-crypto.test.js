import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { decryptBackup, encryptBackup } from '../lib/backup-crypto.js';

process.env.BACKUP_ENCRYPTION_KEY = randomBytes(32).toString('base64');

test('encrypted backup round trips and rejects tampering or a wrong key', () => {
  const plain = Buffer.from(JSON.stringify({ labapp: { inventory: { items: [] } } }), 'utf8');
  const encrypted = encryptBackup(plain);
  assert.notDeepEqual(encrypted, plain);
  assert.deepEqual(decryptBackup(encrypted), plain);
  const envelope = JSON.parse(encrypted.toString('utf8'));
  envelope.ciphertext = Buffer.from(randomBytes(32)).toString('base64');
  assert.throws(() => decryptBackup(Buffer.from(JSON.stringify(envelope))));
  const key = process.env.BACKUP_ENCRYPTION_KEY;
  process.env.BACKUP_ENCRYPTION_KEY = randomBytes(32).toString('base64');
  assert.throws(() => decryptBackup(encrypted));
  process.env.BACKUP_ENCRYPTION_KEY = key;
});
