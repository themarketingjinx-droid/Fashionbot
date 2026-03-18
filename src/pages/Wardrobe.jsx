import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Camera } from 'lucide-react';
import FashionModel3D from '../components/FashionModel3D';
import useStore from '../store/useStore';

export default function Wardrobe() {
  const { pieces, ownedIds } = useStore();
  const owned = pieces.filter((p) => ownedIds.includes(p.id));

  if (owned.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag size={48} className="text-white/20" />
        <h2 className="text-2xl font-black text-white">Your wardrobe is empty</h2>
        <p className="text-white/40 text-sm max-w-xs">
          Browse the gallery and purchase pieces to unlock 3D access and AR try-on.
        </p>
        <Link
          to="/"
          className="mt-2 px-6 py-3 rounded-xl font-bold text-black text-sm bg-gold hover:scale-105 transition-transform"
        >
          Browse Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="text-xs tracking-widest text-gold uppercase mb-2">My Wardrobe</p>
        <h1 className="text-4xl font-black text-white">
          {owned.length} {owned.length === 1 ? 'Piece' : 'Pieces'} Owned
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {owned.map((piece, i) => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            style={{ boxShadow: `0 0 40px 4px ${piece.accentColor}18` }}
          >
            {/* Unlocked 3D viewer */}
            <div className="relative">
              <FashionModel3D
                accentColor={piece.accentColor}
                isLocked={false}
                height={320}
              />
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-lime-400/20 border border-lime-400/40 rounded-full px-3 py-1 text-xs text-lime-400 font-semibold">
                ✓ Owned
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs text-white/30 mb-1">{piece.designer}</p>
              <h3 className="font-bold text-white text-lg mb-1">{piece.name}</h3>
              <p className="text-white/40 text-xs mb-4 line-clamp-2">{piece.description}</p>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/tryon/${piece.id}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-black text-sm"
                  style={{ background: piece.accentColor }}
                >
                  <Camera size={14} /> AR Try-On
                </Link>
                <Link
                  to={`/piece/${piece.id}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-white text-sm border border-white/20 hover:border-white/40"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
