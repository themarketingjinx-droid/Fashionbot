import { useState } from 'react';
import { motion } from 'framer-motion';
import PieceCard from '../components/PieceCard';
import useStore from '../store/useStore';

export default function Gallery() {
  const pieces = useStore((s) => s.pieces);
  const [filter, setFilter] = useState('All');

  const tags = ['All', 'Evening', 'Street', 'Bodycon', 'Outerwear'];
  const filtered =
    filter === 'All' ? pieces : pieces.filter((p) => p.tags.includes(filter));

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      {/* Hero */}
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
        {tags.map((tag) => (
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((piece, i) => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PieceCard piece={piece} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
