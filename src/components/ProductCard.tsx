import { FC } from 'react';
import { Heart, PlusCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  ownerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  createdAt?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  
  const inCart = cart.find(item => item.id === product.id);

  return (
    <div className="bg-white border border-maroon-100/80 rounded-2xl p-4 hover:shadow-lg hover:border-gold-500/30 transition-all duration-300 flex flex-col justify-between h-full relative group">
      
      {/* Top action heart badge */}
      <button 
        onClick={() => toggleWishlist(product)}
        className={`absolute top-6 right-6 z-10 p-2 rounded-full border shadow-sm transition active:scale-95 cursor-pointer ${
          wishlisted 
            ? 'bg-red-600 border-red-600 text-gold-50' 
            : 'bg-white/95 backdrop-blur-xs border-maroon-100 text-slate-500 hover:text-red-500 hover:bg-maroon-50'
        }`}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} className="transition-colors" />
      </button>

      {/* Product Image Stage */}
      <div>
        <div className="w-full aspect-square bg-[#fdfaf1]/70 rounded-xl overflow-hidden mb-4 relative border border-maroon-50 flex items-center justify-center select-none">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-maroon-800/40 gap-1 bg-maroon-50/20">
              <span className="text-xs font-mono tracking-wider font-semibold">SANSKRITII</span>
              <span className="text-[10px] text-maroon-800/40">Heritage Attire</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-maroon-950 text-base group-hover:text-maroon-800 transition-colors tracking-tight line-clamp-1 font-display">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {product.description || 'Heritage quality threads sourced directly from skilled weavers for traditional fine living.'}
          </p>
          
          {/* Seller / Artisan Info */}
          <div className="flex items-center gap-1 text-[11px] text-maroon-800 font-sans select-none pt-0.5">
            <span className="font-medium text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded-md border border-maroon-100/50 truncate max-w-full" title={product.sellerEmail || 'Registered seller'}>
              By: {product.sellerName || 'Independent Weaver'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom price and cart interaction */}
      <div className="mt-4 pt-3 border-t border-maroon-50 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider select-none">Price (INR)</span>
          <span className="font-mono font-bold text-maroon-900 text-base">₹{product.price.toLocaleString('en-IN')}</span>
        </div>

        <button 
          onClick={() => addToCart(product)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold select-none shadow-xs transition active:scale-97 cursor-pointer ${
            inCart
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-maroon-700 text-white hover:bg-maroon-800 border border-gold-500/20'
          }`}
        >
          {inCart ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              In Basket
            </>
          ) : (
            <>
              <PlusCircle size={14} />
              Add Basket
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default ProductCard;
