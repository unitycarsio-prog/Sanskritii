import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { OperationType } from '../lib/types';
import ProductCard, { Product } from './ProductCard';
import { useSearch } from '../context/SearchContext';
import { seedProducts } from '../lib/seed';
import { Sparkles, Compass, HelpCircle, RefreshCcw } from 'lucide-react';
import CustomerReviews from './CustomerReviews';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { searchQuery, sortBy } = useSearch();

  // Categories list derived for filter chips
  const categories = ['All', 'Dhotis', 'Kurtas', 'Sarees'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      await seedProducts();
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Product));
      setProducts(productsData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products by searching term, category selection, and user sort preference
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const descLower = (product.description || '').toLowerCase();
      const nameLower = product.name.toLowerCase();

      // Simple category classification mapping based on description & titles
      let itemCategory = 'Accessories';
      if (nameLower.includes('dhoti') || nameLower.includes('mundu') || descLower.includes('dhoti') || descLower.includes('mundu')) {
        itemCategory = 'Dhotis';
      } else if (nameLower.includes('kurta') || descLower.includes('kurta')) {
        itemCategory = 'Kurtas';
      } else if (nameLower.includes('saree') || descLower.includes('saree') || nameLower.includes('sari') || descLower.includes('sari')) {
        itemCategory = 'Sarees';
      } else {
        itemCategory = 'Accessories';
      }

      // Explicitly reject Accessories from all views (removes from 'All' and general catalog)
      if (itemCategory === 'Accessories') {
        return false;
      }

      const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Apply sorting selection
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      
      // Default: sort by newest arrivals first
      const timeValA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeValB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeValB - timeValA || b.id.localeCompare(a.id);
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Visual Editorial Hero Banner */}
      <div className="relative bg-maroon-950 text-white rounded-3xl overflow-hidden shadow-xl py-14 px-8 sm:px-14 flex flex-col justify-center min-h-[250px] border border-gold-500/30">
        {/* Subtle decorative pattern/gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 opacity-95" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Borders of gold silk thread motif */}
        <div className="absolute left-4 top-4 right-4 bottom-4 border border-gold-500/20 rounded-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-saffron-500/10 border border-saffron-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-saffron-500 select-none">
            <Sparkles size={11} className="text-gold-500" />
            Heritage Weaves of Bharat
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-display text-gold-100 leading-tight">
            Draped in Tradition, <br className="hidden sm:inline" />Woven with Heritage
          </h2>
          <p className="text-xs sm:text-sm text-amber-500/80 leading-relaxed font-sans max-w-lg font-medium">
            Discover pristine gold-bordered Varanasi Swarna-Zari cotton dhotis, authentic Kerala double mundus, and exquisite pure silk sarees crafted with generational devotion.
          </p>
        </div>
      </div>

      {/* Categories Horizontal Filter Chips Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-maroon-100 pb-5">
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-maroon-700 text-gold-50 shadow-md border border-gold-500/30 transform scale-[1.02]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-maroon-500 hover:text-maroon-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sync Feed Button */}
        <button
          onClick={fetchProducts}
          title="Refresh products"
          className="text-xs text-maroon-700 hover:text-saffron-600 flex items-center gap-1.5 font-bold transition cursor-pointer"
        >
          <RefreshCcw size={12} className="animate-pulse" />
          Sync Swadeshi catalog
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 font-sans flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <span className="text-sm">Unpacking selected wares...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-8">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Compass size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-display mb-1">No items match your selection</h3>
          <p className="text-xs text-slate-500 mb-6">Try refining your search terms or choosing a different design category.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
            }}
            className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Customer Patrons reviews layer */}
      <CustomerReviews />
    </div>
  );
}
