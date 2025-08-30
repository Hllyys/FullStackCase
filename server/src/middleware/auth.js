const { verifyAccessToken } = require('../utils/jwt');

function authGuard(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: { message: 'Missing Authorization header' } });
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: { message: 'Invalid auth header' } });
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}
module.exports = { authGuard };
