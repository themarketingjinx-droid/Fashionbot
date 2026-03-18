import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, Tag, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import FashionModel3D from '../components/FashionModel3D';
import useStore from '../store/useStore';
import { fetchPiece } from '../lib/api';

export default function PieceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { walletConnected, connectWallet, purchasePiece, isOwned } = useStore();

  const [piece, setPiece] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [justBought, setJustBought] = useState(false);

  const owned = isOwned(id) || piece?.owned;

  useEffect(() => {
    fetchPiece(id)
      .then(setPiece)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }
    setBuying(true);
    try {
      await new Promise((r) => setTimeout(r, 1800)); // simulate tx confirmation
      await purchasePiece(id);
      setJustBought(true);
      // Refresh piece to get owned flag + modelUrl
      const updated = await fetchPiece(id);
      setPiece(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !piece) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <p className="text-red-400">{error || 'Piece not found'}</p>
      </div>
    );
  }

  // Use piece accent color or fall back to gold
  const accentColor = piece.accentColor || '#c9a84c';

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
        <div
          className="rounded-2xl overflow-hidden border border-white/10 bg-black/60"
          style={{ boxShadow: `0 0 60px 10px ${accentColor}22` }}
        >
          <FashionModel3D accentColor={accentColor} isLocked={!owned} height={520} />
        </div>

        {/* Info Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest text-white/40 uppercase mb-2">{piece.designerName}</p>
            <h1 className="text-4xl font-black text-white leading-tight">{piece.name}</h1>
            <p className="mt-1 text-sm text-white/30">1 of {piece.editionSize}</p>
          </div>

          <p className="text-white/60 leading-relaxed">{piece.description}</p>

          <div className="flex flex-wrap gap-2">
            {(piece.tags || []).map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/8 text-white/50 border border-white/10">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Price', value: `${piece.price} ${piece.currency}` },
              { label: 'Edition', value: `1 of ${piece.editionSize}` },
              { label: 'Blockchain', value: 'Ethereum' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-white/30 mb-1">{label}</p>
                <p className="font-bold text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Ownership unlocks */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Ownership Unlocks</p>
            {[
              'Full 3D file access (GLB + FBX)',
              'AR body-capture try-on',
              'Full-res texture maps',
              'Commercial usage license',
            ].map((label) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                {owned ? (
                  <Unlock size={14} className="text-lime-400 flex-shrink-0" />
                ) : (
                  <Lock size={14} className="text-white/20 flex-shrink-0" />
                )}
                <span className={owned ? 'text-white' : 'text-white/30'}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <AnimatePresence mode="wait">
            {justBought ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-5 bg-lime-400/10 border border-lime-400/30 flex flex-col items-center gap-3"
              >
                <CheckCircle2 size={32} className="text-lime-400" />
                <p className="font-bold text-lime-400 text-lg">Purchase Complete!</p>
                <p className="text-white/50 text-sm text-center">You now own this piece. Try it on below.</p>
                <button onClick={() => navigate(`/tryon/${id}`)}
                  className="mt-1 w-full py-3 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2 glow-green"
                  style={{ background: '#84cc16' }}
                >
                  <Camera size={16} /> Launch AR Try-On
                </button>
              </motion.div>
            ) : owned ? (
              <motion.button key="tryon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => navigate(`/tryon/${id}`)}
                className="w-full py-4 rounded-xl font-black text-black text-base flex items-center justify-center gap-2 glow-green transition-transform hover:scale-[1.02]"
                style={{ background: '#84cc16' }}
              >
                <Camera size={18} /> Launch AR Try-On
              </motion.button>
            ) : (
              <motion.button key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={handleBuy} disabled={buying}
                className="w-full py-4 rounded-xl font-black text-black text-base flex items-center justify-center gap-2 glow-gold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: accentColor }}
              >
                {buying ? (
                  <><Loader2 size={18} className="animate-spin" /> Minting on-chain…</>
                ) : !walletConnected ? (
                  '🔗 Connect Wallet to Buy'
                ) : (
                  `Buy for ${piece.price} ${piece.currency}`
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
