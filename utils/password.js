const crypto = require('crypto');

const KEY_LENGTH = 64;

function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedValue) {
  if (!password || !storedValue) {
    return false;
  }

  const [salt, key] = storedValue.split(':');
  if (!salt || !key) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
}

module.exports = {
  hashPassword,
  verifyPassword,
};
