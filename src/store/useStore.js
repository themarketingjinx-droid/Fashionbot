import { create } from 'zustand';
import * as api from '../lib/api';

const useStore = create((set, get) => ({
  // ── Pieces ──────────────────────────────────────────────────────────────
  pieces: [],
  piecesLoading: false,
  piecesError: null,

  loadPieces: async (params) => {
    set({ piecesLoading: true, piecesError: null });
    try {
      const pieces = await api.fetchPieces(params);
      set({ pieces, piecesLoading: false });
    } catch (err) {
      set({ piecesError: err.message, piecesLoading: false });
    }
  },

  // ── Auth / Wallet ────────────────────────────────────────────────────────
  walletConnected: !!api.getStoredToken(),
  walletAddress: localStorage.getItem('drip_address') || '',
  userId: localStorage.getItem('drip_userId') || '',

  connectWallet: async () => {
    // Simulate picking a wallet address (real apps use window.ethereum)
    const mockAddress = '0x' + Array.from({ length: 40 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    try {
      const data = await api.connectWallet(mockAddress);
      localStorage.setItem('drip_address', data.walletAddress);
      localStorage.setItem('drip_userId', data.userId);
      set({ walletConnected: true, walletAddress: data.walletAddress, userId: data.userId });
      // Reload pieces with auth so owned flags are set
      get().loadPieces();
      get().loadOwnedPieces();
    } catch (err) {
      console.error('Wallet connect failed:', err.message);
    }
  },

  disconnectWallet: () => {
    api.clearAuth();
    localStorage.removeItem('drip_address');
    localStorage.removeItem('drip_userId');
    set({ walletConnected: false, walletAddress: '', userId: '', ownedPieces: [] });
  },

  // ── Purchases / Owned ────────────────────────────────────────────────────
  ownedPieces: [],
  ownedLoading: false,

  loadOwnedPieces: async () => {
    if (!api.getStoredToken()) return;
    set({ ownedLoading: true });
    try {
      const purchases = await api.fetchMyPieces();
      set({ ownedPieces: purchases.map((p) => p.piece), ownedLoading: false });
    } catch {
      set({ ownedLoading: false });
    }
  },

  isOwned: (id) => get().ownedPieces.some((p) => p.id === id),

  purchasePiece: async (pieceId) => {
    const data = await api.purchasePiece(pieceId);
    // Refresh both lists
    await get().loadPieces();
    await get().loadOwnedPieces();
    return data;
  },
}));

export default useStore;
