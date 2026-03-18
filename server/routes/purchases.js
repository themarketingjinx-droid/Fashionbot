/**
 * Purchases routes
 *
 * POST /api/purchases        — record a purchase / mock mint (auth required)
 * GET  /api/purchases/mine   — list caller's owned pieces (auth required)
 */
import { Router } from 'express';
import prisma from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { gatewayUrl, isPinataConfigured } from '../lib/pinata.js';

const router = Router();

// ─── POST /api/purchases ────────────────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  const { pieceId, txHash } = req.body;

  if (!pieceId) return res.status(400).json({ error: 'pieceId is required' });

  const piece = await prisma.piece.findUnique({ where: { id: pieceId } });
  if (!piece || !piece.published) return res.status(404).json({ error: 'Piece not found' });

  // Check not already owned
  const existing = await prisma.purchase.findUnique({
    where: { userId_pieceId: { userId: req.user.userId, pieceId } },
  });
  if (existing) return res.status(409).json({ error: 'Already purchased' });

  const purchase = await prisma.purchase.create({
    data: {
      userId: req.user.userId,
      pieceId,
      txHash: txHash || null,
      pricePaid: piece.price,
      currency: piece.currency,
    },
  });

  res.status(201).json({ purchase, message: 'Purchase recorded. You now own this piece.' });
});

// ─── GET /api/purchases/mine ────────────────────────────────────────────────

router.get('/mine', requireAuth, async (req, res) => {
  const purchases = await prisma.purchase.findMany({
    where: { userId: req.user.userId },
    include: { piece: true },
    orderBy: { createdAt: 'desc' },
  });

  const result = purchases.map(({ piece, ...purchase }) => ({
    ...purchase,
    piece: {
      ...piece,
      tags: piece.tags ? piece.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      previewUrl: piece.previewCid.startsWith('local:')
        ? `/api/files/${piece.previewCid.replace('local:', '')}`
        : gatewayUrl(piece.previewCid),
      modelUrl: piece.modelCid.startsWith('local:')
        ? `/api/files/${piece.modelCid.replace('local:', '')}`
        : gatewayUrl(piece.modelCid),
      owned: true,
    },
  }));

  res.json(result);
});

export default router;
