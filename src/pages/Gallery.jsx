import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PieceCard from '../components/PieceCard';
import useStore from '../store/useStore';

const TAGS = ['All', 'Evening', 'Street', 'Bodycon', 'Outerwear'];

export default function Gallery() {
  const { pieces, piecesLoading, piecesError, loadPieces, loadOwnedPieces } = useStore();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadPieces();
    loadOwnedPieces();
  }, []);

  const filtered =
    filter === 'All' ? pieces : pieces.filter((p) => p.tags?.includes(filter));

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4">
          Digital Fashion · On-Chain
        </p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
          DRIP<span className="text-gold">NFT</span>
        </h1>
        <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
          3D fashion NFTs you can wear in the real world. Preview. Buy. Measure.
        </p>
      </motion.div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === tag
                ? 'bg-gold border-gold text-black'
                : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* States */}
      {piecesLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {piecesError && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-2">{piecesError}</p>
          <p className="text-white/30 text-sm">Make sure the API server is running on port 3001.</p>
        </div>
      )}

      {!piecesLoading && !piecesError && filtered.length === 0 && (
        <div className="text-center py-24 text-white/30">
          <p className="text-lg font-semibold mb-2">No pieces yet</p>
          <p className="text-sm">Designers can upload pieces via the Design tab.</p>
        </div>
      )}

      {/* Grid */}
      {!piecesLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((piece, i) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <PieceCard piece={piece} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
