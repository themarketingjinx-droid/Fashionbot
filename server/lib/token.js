import jwt from 'jsonwebtoken';

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return process.env.JWT_SECRET;
};

/**
 * Issue a wallet-identity token (used as the user session).
 * payload: { walletAddress, userId }
 */
export function signAuthToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: '7d' });
}

/**
 * Issue a short-lived signed URL token granting access to a specific piece's
 * full 3D model CID. Only issued after ownership is verified.
 * payload: { userId, pieceId, cid }
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: '15m' });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}
