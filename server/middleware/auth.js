import { verifyToken } from '../lib/token.js';

/**
 * Require a valid auth JWT in the Authorization header.
 * Attaches { userId, walletAddress } to req.user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.user = { userId: payload.userId, walletAddress: payload.walletAddress };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Attach user info if token present, but don't block if missing.
 */
export function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      req.user = { userId: payload.userId, walletAddress: payload.walletAddress };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
