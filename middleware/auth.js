const { verifyToken } = require('../utils/jwt');

function auth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  const authorization = req.headers.authorization || '';
  const [scheme, rawToken] = authorization.split(' ');
  const token = rawToken && rawToken.trim();

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing Bearer token' });
  }

  try {
    const payload = verifyToken(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || 'Invalid token' });
  }
}

module.exports = auth;
