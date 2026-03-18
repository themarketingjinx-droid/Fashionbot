/**
 * POST /api/auth/connect
 * Body: { walletAddress }
 *
 * In a production app this would verify an EIP-712 signed message.
 * Here we accept the wallet address and issue a JWT, creating the user
 * if they don't already exist.
 */
import { Router } from 'express';
import prisma from '../lib/db.js';
import { signAuthToken } from '../lib/token.js';

const router = Router();

router.post('/connect', async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const user = await prisma.user.upsert({
    where: { walletAddress },
    create: { walletAddress },
    update: {},
  });

  const token = signAuthToken({ userId: user.id, walletAddress: user.walletAddress });

  res.json({ token, userId: user.id, walletAddress: user.walletAddress });
});

export default router;
