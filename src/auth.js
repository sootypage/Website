const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { nanoid } = require('nanoid');
const { getStore, saveStore } = require('./store');

function createFirstAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const users = getStore('users');
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return;

  users.push({
    id: nanoid(),
    username: 'admin',
    email,
    passwordHash: bcrypt.hashSync(password, 12),
    panelPasswordEnc: encryptPanelPassword(password),
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  saveStore('users', users);
  console.log(`Created first admin: ${email}`);
}

function encryptPanelPassword(password) {
  const secret = process.env.APP_SECRET || 'dev-secret-change-me-dev-secret';
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptPanelPassword(value) {
  const secret = process.env.APP_SECRET || 'dev-secret-change-me-dev-secret';
  const key = crypto.createHash('sha256').update(secret).digest();
  const [ivHex, tagHex, encryptedHex] = value.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

module.exports = { createFirstAdmin, encryptPanelPassword, decryptPanelPassword };
