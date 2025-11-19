const crypto = require('crypto');

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  value = value.replace(/-/g, '+').replace(/_/g, '/');
  while (value.length % 4 !== 0) {
    value += '=';
  }

  return Buffer.from(value, 'base64').toString('utf8');
}

function createSignature(unsignedToken, secret) {
  return base64UrlEncode(crypto.createHmac('sha256', secret).update(unsignedToken).digest());
}

function parseDuration(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error('Invalid expiresIn format');
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return amount;
  }
}

function signToken(payload, secret, options = {}) {
  if (!secret) {
    throw new Error('JWT secret missing');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload };
  if (!body.iat) {
    body.iat = now;
  }

  if (options.expiresIn) {
    const ttl = parseDuration(options.expiresIn);
    body.exp = now + ttl;
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(unsigned, secret);

  return `${unsigned}.${signature}`;
}

function verifyToken(token, secret) {
  if (!secret) {
    throw new Error('JWT secret missing');
  }

  const parts = token ? token.split('.') : [];
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createSignature(unsigned, secret);

  const signatureBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
  parseDuration,
};
