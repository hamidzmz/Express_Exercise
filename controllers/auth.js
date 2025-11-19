const { findUserByEmail } = require('../models/user');
const { verifyPassword } = require('../utils/password');
const { signToken, parseDuration } = require('../utils/jwt');

const DEFAULT_EXPIRATION = process.env.JWT_EXPIRES_IN || '1h';

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await findUserByEmail(email, { includePassword: true });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const expiresIn = parseDuration(DEFAULT_EXPIRATION);
    const tokenPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    const token = signToken(tokenPayload, secret, { expiresIn });
    const { passwordHash, ...publicUser } = user;

    res.json({
      token,
      expiresIn,
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
