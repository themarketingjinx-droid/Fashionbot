import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, Tag, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import FashionModel3D from '../components/FashionModel3D';
import useStore from '../store/useStore';

export default function PieceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pieces, walletConnected, connectWallet, purchasePiece, isOwned } = useStore();
  const piece = pieces.find((p) => p.id === id);
  const owned = isOwned(id);

  const [buying, setBuying] = useState(false);
  const [justBought, setJustBought] = useState(false);

  if (!piece) return <div className="pt-24 text-center text-white/40">Piece not found.</div>;

  const handleBuy = async () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }
    setBuying(true);
    await new Promise((r) => setTimeout(r, 2200)); // simulate tx
    purchasePiece(id);
    setBuying(false);
    setJustBought(true);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mt-6 mb-8 text-sm"
      >
        <ArrowLeft size={16} /> Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 3D Viewer */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60" style={{ boxShadow: `0 0 60px 10px ${piece.accentColor}22` }}>
          <FashionModel3D
            accentColor={piece.accentColor}
            isLocked={!owned}
            height={520}
          />
        </div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div>
            <p className="text-xs tracking-widest text-white/40 uppercase mb-2">{piece.designer}</p>
            <h1 className="text-4xl font-black text-white leading-tight">{piece.name}</h1>
            <p className="mt-1 text-sm text-white/30">{piece.edition}</p>
          </div>

          <p className="text-white/60 leading-relaxed">{piece.description}</p>

          <div className="flex flex-wrap gap-2">
            {piece.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/8 text-white/50 border border-white/10"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Price', value: `${piece.price} ${piece.currency}` },
              { label: 'Edition', value: piece.edition },
              { label: 'Blockchain', value: 'Ethereum' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-white/30 mb-1">{label}</p>
                <p className="font-bold text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Features locked/unlocked */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Ownership Unlocks</p>
            {[
              { label: 'Full 3D file access (GLB + FBX)', available: owned },
              { label: 'AR body-capture try-on', available: owned },
              { label: 'Full-res texture maps', available: owned },
              { label: 'Commercial usage license', available: owned },
            ].map(({ label, available }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                {available ? (
                  <Unlock size={14} className="text-lime-400 flex-shrink-0" />
                ) : (
                  <Lock size={14} className="text-white/20 flex-shrink-0" />
                )}
                <span className={available ? 'text-white' : 'text-white/30'}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <AnimatePresence mode="wait">
            {justBought ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-5 bg-lime-400/10 border border-lime-400/30 flex flex-col items-center gap-3"
              >
                <CheckCircle2 size={32} className="text-lime-400" />
                <p className="font-bold text-lime-400 text-lg">Purchase Complete!</p>
                <p className="text-white/50 text-sm text-center">
                  You now own this piece. Try it on with your camera below.
                </p>
                <button
                  onClick={() => navigate(`/tryon/${id}`)}
                  className="mt-1 w-full py-3 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2 glow-green"
                  style={{ background: '#84cc16' }}
                >
                  <Camera size={16} /> Launch AR Try-On
                </button>
              </motion.div>
            ) : owned ? (
              <motion.button
                key="tryon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate(`/tryon/${id}`)}
                className="w-full py-4 rounded-xl font-black text-black text-base flex items-center justify-center gap-2 glow-green transition-transform hover:scale-[1.02]"
                style={{ background: '#84cc16' }}
              >
                <Camera size={18} /> Launch AR Try-On
              </motion.button>
            ) : (
              <motion.button
                key="buy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleBuy}
                disabled={buying}
                className="w-full py-4 rounded-xl font-black text-black text-base flex items-center justify-center gap-2 glow-gold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: piece.accentColor }}
              >
                {buying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Minting on-chain…
                  </>
                ) : (
                  <>
                    {!walletConnected ? '🔗 Connect Wallet to Buy' : `Buy for ${piece.price} ${piece.currency}`}
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
