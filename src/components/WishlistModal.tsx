import { X, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from './ProductCard';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { wishlist } = useWishlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold font-display">My Boutique Wishlist</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition"
            title="Close wishlist"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 max-w-xs mx-auto">
              <div className="w-12 h-12 bg-slate-50 border rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Heart size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display mb-1">Your wishlist is empty</h3>
              <p className="text-sm text-slate-500 mb-6">Explore our designer assets and save items for your curated collection.</p>
              <button
                onClick={onClose}
                className="bg-slate-950 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
              {wishlist.map(product => (
                <div key={product.id} className="relative scale-95 origin-center">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} curated in wishlist</span>
            <span className="font-medium text-slate-700">Added to personal collection</span>
          </div>
        )}
      </div>
    </div>
  );
}
