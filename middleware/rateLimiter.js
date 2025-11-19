const rateLimit = require('express-rate-limit');

function createLimiter(options) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
    ...options,
  });
}

const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
});

const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
});

const readLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 40,
});

const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 15,
});

module.exports = {
  globalLimiter,
  authLimiter,
  readLimiter,
  writeLimiter,
};
