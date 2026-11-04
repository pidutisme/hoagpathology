import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function keyFromEnv() {
  const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || '', 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY must be a base64 encoded 32-byte key.');
  return key;
}

export function encryptBackup(plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFromEnv(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.from(JSON.stringify({ version: 1, algorithm: 'AES-256-GCM', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') }));
}

export function decryptBackup(envelopeBytes) {
  const envelope = JSON.parse(Buffer.from(envelopeBytes).toString('utf8'));
  if (envelope?.version !== 1 || envelope?.algorithm !== 'AES-256-GCM') throw new Error('Unsupported backup envelope.');
  const decipher = createDecipheriv('aes-256-gcm', keyFromEnv(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]);
}
