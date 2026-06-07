import { ShoppingCart, Search, Heart, Store, Compass, LogOut, User as UserIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  viewMode: 'buyer' | 'seller';
  onToggleView: (mode: 'buyer' | 'seller') => void;
}

export default function Header({ onOpenWishlist, onOpenCart, onOpenProfile, viewMode, onToggleView }: HeaderProps) {
  const { cartCount } = useCart();
  const { searchQuery, setSearchQuery, sortBy, setSortBy } = useSearch();
  const { wishlist } = useWishlist();
  const { user, loginWithGoogle, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-maroon-100 sticky top-0 z-40 transition-all duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            {/* Custom crafted royal golden lotus logo emblem representing traditional luxury */}
            <svg className="w-9 h-9 text-gold-500 drop-shadow-md select-none transform hover:rotate-6 transition duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="44" fill="#801b22" stroke="#d4af37" strokeWidth="3" />
              <circle cx="50" cy="50" r="39" stroke="#d4af37" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              {/* Core traditional Kundalini/Lotus flower design */}
              <path d="M50 16 C43 32 25 45 50 84 C75 45 57 32 50 16 Z" fill="#d4af37" opacity="0.95" />
              <path d="M50 25 C35 38 10 52 50 82 C90 52 65 38 50 25 Z" fill="#b89122" opacity="0.75" />
              <path d="M50 34 C42 45 25 55 50 76 C75 55 58 45 50 34 Z" fill="#96252d" />
              {/* Sacred center seed element */}
              <circle cx="50" cy="55" r="5" fill="#facc15" />
              <circle cx="50" cy="55" r="2" fill="#faf1f2" />
            </svg>
            <h1 className="text-2xl font-display font-medium tracking-tight text-maroon-900">
              Sanskritii
            </h1>
          </div>

          {/* Mobile Profile & Switch Triggers */}
          <div className="flex md:hidden items-center gap-3">
            {user ? (
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                alt="user"
                className="w-8 h-8 rounded-full border border-slate-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
            ) : (
              <button onClick={loginWithGoogle} className="text-xs font-semibold text-slate-800 border px-2.5 py-1 rounded-md">
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Buyer Search & Sorting bar */}
        {viewMode === 'buyer' ? (
          <div className="w-full md:flex-grow md:max-w-xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="w-full sm:flex-grow relative">
              <Search className="absolute left-3.5 top-2.5 text-maroon-600" size={16} />
              <input
                type="text"
                placeholder="Search traditional dhotis, cotton mundus, tussar silk kurtas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-maroon-50/20 border border-maroon-100 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-maroon-500/5 focus:border-maroon-700 transition-all duration-200"
              />
            </div>

            {/* Premium Custom Sorting select container with chevron indicator */}
            <div className="w-full sm:w-auto shrink-0 relative">
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-[170px] bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-slate-950/5 focus:border-slate-800 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="newest">🕒 Newest Arrivals</option>
                <option value="price-low">📉 Price: Low to High</option>
                <option value="price-high">📈 Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:block flex-1 max-w-sm text-center">
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium tracking-wide select-none">
              Seller mode active
            </span>
          </div>
        )}

        {/* Actions section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
          
          {/* Segmented Controller Toggle Switch (Buyer vs Seller) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 select-none">
            <button
              onClick={() => onToggleView('buyer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-medium transition-all ${
                viewMode === 'buyer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass size={14} />
              Buyer View
            </button>
            <button
              onClick={() => onToggleView('seller')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-medium transition-all ${
                viewMode === 'seller'
                  ? 'bg-maroon-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store size={14} />
              Seller View
            </button>
          </div>

          {/* Navigation & Basket/Wishlist Icons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenWishlist} 
              className="relative text-slate-500 hover:text-red-500 p-1.5 hover:bg-slate-50 rounded-lg transition"
              title="View Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenCart} 
              className="relative text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-50 rounded-lg transition"
              title="View Basket"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-slate-950 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {viewMode === 'buyer' && (
              <button 
                onClick={onOpenProfile} 
                className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-50 rounded-lg transition"
                title="Buyer Profile & Order History"
              >
                <UserIcon size={20} />
              </button>
            )}

            {/* Desktop User Account/Auth State */}
            <div className="hidden md:block relative">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 p-1 pr-2.5 rounded-full transition bg-white"
                  >
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                      alt="avatar"
                      className="w-6.5 h-6.5 rounded-full object-cover border border-slate-100"
                    />
                    <span className="text-xs text-slate-700 font-medium max-w-[80px] truncate">{user.displayName || 'Seller User'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44 z-50 text-slate-700 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-800 truncate">{user.displayName || 'Demo Seller'}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      {viewMode === 'buyer' && (
                        <button
                          onClick={() => {
                            onOpenProfile();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-slate-50 text-slate-800 transition border-b border-slate-100/60"
                        >
                          <UserIcon size={13} strokeWidth={2.5} />
                          Profile & Orders
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-red-50 text-red-600 transition"
                      >
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="bg-transparent border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
                >
                  <UserIcon size={14} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
