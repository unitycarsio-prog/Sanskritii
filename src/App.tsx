import { useState } from 'react';
import ProductList from './components/ProductList';
import Header from './components/Header';
import WishlistModal from './components/WishlistModal';
import CartDrawer from './components/CartDrawer';
import OrderHistoryDrawer from './components/OrderHistoryDrawer';
import SellerDashboard from './components/SellerDashboard';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { WishlistProvider } from './context/WishlistContext';

export default function App() {
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-slate-900 selection:bg-slate-950 selection:text-white font-sans antialiased">
              <div>
                {/* Header */}
                <Header 
                  viewMode={viewMode}
                  onToggleView={setViewMode}
                  onOpenWishlist={() => setIsWishlistOpen(true)}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenProfile={() => setIsProfileOpen(true)}
                />

                {/* Main Content Showcase depending on View Mode */}
                <main className="max-w-7xl mx-auto px-6 py-8">
                  {viewMode === 'buyer' ? (
                    <ProductList />
                  ) : (
                    <SellerDashboard onSwitchToBuyer={() => setViewMode('buyer')} />
                  )}
                </main>
              </div>

              {/* Footer */}
              <Footer />

              {/* Wishlist Modal Overlay */}
              <WishlistModal 
                isOpen={isWishlistOpen} 
                onClose={() => setIsWishlistOpen(false)} 
              />

              {/* Shopping Cart Drawer Sidebar */}
              <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
              />

              {/* Buyer Profile & Order History Drawer */}
              <OrderHistoryDrawer 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
              />
            </div>
          </WishlistProvider>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
