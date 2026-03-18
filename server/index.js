import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import piecesRoutes from './routes/pieces.js';
import purchasesRoutes from './routes/purchases.js';
import filesRoutes from './routes/files.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/pieces', piecesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/files', filesRoutes);

// ── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', pinataConfigured: !!(process.env.PINATA_API_KEY) });
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`DRIP NFT API running on http://localhost:${PORT}`);
  console.log(`Pinata configured: ${!!(process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET)}`);
});
