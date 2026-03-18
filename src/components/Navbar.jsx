import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Shirt, Upload, Wallet } from 'lucide-react';
import useStore from '../store/useStore';

export default function Navbar() {
  const { pathname } = useLocation();
  const { walletConnected, walletAddress, connectWallet, ownedPieces } = useStore();

  const links = [
    { to: '/', label: 'Gallery', icon: Shirt },
    { to: '/wardrobe', label: 'Wardrobe', icon: ShoppingBag },
    { to: '/designer', label: 'Design', icon: Upload },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md border-b border-white/10">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-gold">DRIP</span>
        <span className="text-2xl font-black tracking-tight text-white">NFT</span>
      </Link>

      <div className="flex items-center gap-6">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              pathname === to ? 'text-gold' : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
            {to === '/wardrobe' && ownedPieces.length > 0 && (
              <span className="ml-1 bg-gold text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {ownedPieces.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      <button
        onClick={connectWallet}
        disabled={walletConnected}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
          walletConnected
            ? 'border-gold text-gold bg-gold/10 cursor-default'
            : 'border-white/30 text-white hover:border-gold hover:text-gold'
        }`}
      >
        <Wallet size={14} />
        {walletConnected
          ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
          : 'Connect Wallet'}
      </button>
    </nav>
  );
}
