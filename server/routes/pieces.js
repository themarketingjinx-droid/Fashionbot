/**
 * Pieces routes
 *
 * POST   /api/pieces          — designer uploads a new piece (auth required)
 * GET    /api/pieces          — list all published pieces (public)
 * GET    /api/pieces/:id      — get one piece (public fields only unless owned)
 * GET    /api/pieces/:id/access-token — issue a signed URL token for the full model (owner only)
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/db.js';
import { pinFile, pinJSON, gatewayUrl, isPinataConfigured } from '../lib/pinata.js';
import { signAccessToken } from '../lib/token.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadModel } from '../middleware/upload.js';

const router = Router();

// ─── POST /api/pieces ──────────────────────────────────────────────────────

router.post('/', requireAuth, (req, res, next) => {
  uploadModel(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const { name, description, designerName, price, currency, editionSize, tags } = req.body;

  if (!req.file) return res.status(400).json({ error: 'No 3D model file uploaded' });
  if (!name || !description || !designerName || !price) {
    return res.status(400).json({ error: 'name, description, designerName, price are required' });
  }

  const filePath = req.file.path;
  const fileName = path.basename(filePath);

  let modelCid, previewCid, metadataCid;

  if (isPinataConfigured()) {
    // Pin full model (gated) and a public preview placeholder
    [modelCid, previewCid] = await Promise.all([
      pinFile(filePath, `model-${name}`),
      pinFile(filePath, `preview-${name}`), // In production: serve a watermarked/degraded version
    ]);

    // Build and pin NFT metadata JSON (ERC-721 compatible)
    metadataCid = await pinJSON({
      name,
      description,
      image: gatewayUrl(previewCid),
      animation_url: gatewayUrl(modelCid),
      attributes: [
        { trait_type: 'Designer', value: designerName },
        { trait_type: 'Edition', value: `1 of ${editionSize || 1}` },
        ...(tags ? tags.split(',').map((t) => ({ trait_type: 'Tag', value: t.trim() })) : []),
      ],
    }, `metadata-${name}`);

    // Clean up local upload after pinning
    fs.unlink(filePath, () => {});
    modelCid = modelCid;
    previewCid = previewCid;
  } else {
    // Dev mode: store locally, use a placeholder CID
    modelCid = `local:${fileName}`;
    previewCid = `local:${fileName}`;
  }

  const piece = await prisma.piece.create({
    data: {
      name,
      description,
      designerId: req.user.userId,
      designerName,
      price: parseFloat(price),
      currency: currency || 'ETH',
      editionSize: parseInt(editionSize) || 1,
      tags: tags || '',
      modelCid,
      previewCid,
      metadataCid: metadataCid || null,
      published: true,
    },
  });

  res.status(201).json({ piece: sanitizePiece(piece, false) });
});

// ─── GET /api/pieces ────────────────────────────────────────────────────────

router.get('/', optionalAuth, async (req, res) => {
  const { tag, designer } = req.query;

  const where = { published: true };
  if (designer) where.designerName = { contains: designer };

  const pieces = await prisma.piece.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // If user is logged in, mark which ones they own
  let ownedIds = new Set();
  if (req.user) {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user.userId },
      select: { pieceId: true },
    });
    ownedIds = new Set(purchases.map((p) => p.pieceId));
  }

  const filtered = tag
    ? pieces.filter((p) => p.tags.toLowerCase().includes(tag.toLowerCase()))
    : pieces;

  res.json(filtered.map((p) => sanitizePiece(p, ownedIds.has(p.id))));
});

// ─── GET /api/pieces/:id ────────────────────────────────────────────────────

router.get('/:id', optionalAuth, async (req, res) => {
  const piece = await prisma.piece.findUnique({ where: { id: req.params.id } });
  if (!piece || !piece.published) return res.status(404).json({ error: 'Not found' });

  let owned = false;
  if (req.user) {
    const purchase = await prisma.purchase.findUnique({
      where: { userId_pieceId: { userId: req.user.userId, pieceId: piece.id } },
    });
    owned = !!purchase;
  }

  res.json(sanitizePiece(piece, owned));
});

// ─── GET /api/pieces/:id/access-token ───────────────────────────────────────

router.get('/:id/access-token', requireAuth, async (req, res) => {
  const piece = await prisma.piece.findUnique({ where: { id: req.params.id } });
  if (!piece) return res.status(404).json({ error: 'Not found' });

  const purchase = await prisma.purchase.findUnique({
    where: { userId_pieceId: { userId: req.user.userId, pieceId: piece.id } },
  });

  if (!purchase) {
    return res.status(403).json({ error: 'You do not own this piece' });
  }

  // Issue a short-lived token granting access to the real model CID
  const accessToken = signAccessToken({
    userId: req.user.userId,
    pieceId: piece.id,
    cid: piece.modelCid,
  });

  const url = isPinataConfigured()
    ? gatewayUrl(piece.modelCid)
    : `/api/files/${piece.modelCid.replace('local:', '')}`;

  res.json({ accessToken, modelUrl: url });
});

// ─── Helper ─────────────────────────────────────────────────────────────────

/**
 * Strip the private modelCid from the response unless the caller owns the piece.
 * previewCid is always returned as the public-facing URL.
 */
function sanitizePiece(piece, owned) {
  const { modelCid, previewCid, ...pub } = piece;

  const previewUrl = previewCid.startsWith('local:')
    ? `/api/files/${previewCid.replace('local:', '')}`
    : gatewayUrl(previewCid);

  return {
    ...pub,
    tags: pub.tags ? pub.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    previewUrl,
    owned,
    // Only expose the real model URL to owners (frontend still needs access-token endpoint)
    ...(owned && {
      modelCid,
      modelUrl: modelCid.startsWith('local:')
        ? `/api/files/${modelCid.replace('local:', '')}`
        : gatewayUrl(modelCid),
    }),
  };
}

export default router;
