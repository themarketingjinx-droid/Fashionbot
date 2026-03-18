import { Link } from 'react-router-dom';
import { Lock, Tag } from 'lucide-react';
import FashionModel3D from './FashionModel3D';
import useStore from '../store/useStore';

export default function PieceCard({ piece }) {
  const isOwned = useStore((s) => s.isOwned(piece.id));

  return (
    <Link
      to={`/piece/${piece.id}`}
      className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 hover:shadow-xl"
      style={{ '--accent': piece.accentColor }}
    >
      {/* 3D Preview - always locked in gallery */}
      <div className="relative bg-black/60">
        <FashionModel3D
          accentColor={piece.accentColor}
          isLocked={!isOwned}
          height={280}
        />
        {isOwned && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-lime-400/20 border border-lime-400/40 rounded-full px-3 py-1 text-xs text-lime-400 font-semibold">
            <span>✓</span> Owned
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-white/40 mb-1">{piece.designer}</p>
            <h3 className="font-bold text-white text-base leading-tight">{piece.name}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black" style={{ color: piece.accentColor }}>
              {piece.price} {piece.currency}
            </p>
            <p className="text-xs text-white/30">{piece.edition}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {piece.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {!isOwned && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-white/30">
            <Lock size={11} />
            Purchase to unlock full access & AR try-on
          </div>
        )}
      </div>
    </Link>
  );
}
