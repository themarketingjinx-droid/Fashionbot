import { create } from 'zustand';
import { PIECES } from '../data/pieces';

const useStore = create((set, get) => ({
  pieces: PIECES,
  ownedIds: [],
  walletConnected: false,
  walletAddress: '',

  connectWallet: () =>
    set({
      walletConnected: true,
      walletAddress: '0x' + Math.random().toString(16).slice(2, 14) + '...',
    }),

  purchasePiece: (id) =>
    set((state) => ({
      ownedIds: [...state.ownedIds, id],
      pieces: state.pieces.map((p) =>
        p.id === id ? { ...p, owned: true } : p
      ),
    })),

  isOwned: (id) => get().ownedIds.includes(id),
}));

export default useStore;
