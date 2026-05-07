import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY = process.env.ENCRYPTION_KEY;

export function encrypt(text: string): string {
  if (!KEY) throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  
  // Key must be exactly 32 bytes for aes-256-gcm
  const keyBuffer = Buffer.alloc(32, KEY, 'utf8');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!KEY) throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  
  const keyBuffer = Buffer.alloc(32, KEY, 'utf8');
  const [ivHex, tagHex, encryptedHex] = encryptedText.split(':');
  
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
