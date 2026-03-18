/**
 * Protected file-serving route (dev mode only — when Pinata is not configured).
 *
 * GET /api/files/:filename?token=<accessToken>
 *
 * The access token (issued by GET /api/pieces/:id/access-token) is a
 * short-lived JWT that ties a specific userId → pieceId → filename.
 * Without a valid token, the file is not served.
 *
 * In production with Pinata, the full model CID is never exposed to
 * un-authed clients — the frontend requests a signed access token first,
 * then streams directly from the IPFS gateway using that token as proof.
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../lib/token.js';

const router = Router();
const UPLOAD_DIR = path.resolve('./uploads');

router.get('/:filename', (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(401).json({ error: 'Access token required' });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }

  // Ensure the token's cid matches the requested filename
  const expectedFile = payload.cid?.replace('local:', '');
  if (expectedFile !== req.params.filename) {
    return res.status(403).json({ error: 'Token does not match requested file' });
  }

  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Prevent caching of protected files
  res.set('Cache-Control', 'no-store');
  res.set('Content-Disposition', 'attachment');
  res.sendFile(filePath);
});

export default router;
