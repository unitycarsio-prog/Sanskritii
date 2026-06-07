import { useState, useEffect, FormEvent } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { OperationType } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Package, IndianRupee, BarChart2, Eye, Compass } from 'lucide-react';
import { Product } from './ProductCard';

interface SellerDashboardProps {
  onSwitchToBuyer: () => void;
}

export default function SellerDashboard({ onSwitchToBuyer }: SellerDashboardProps) {
  const { user, loginWithGoogle } = useAuth();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch only user's products
  const fetchMyProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setMyProducts(productsData);
    } catch (error) {
      // Catch error with custom context
      handleFirestoreError(error, OperationType.LIST, `products (owner:${user.uid})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) return setFormError('Product Name is required');
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return setFormError('Please enter a valid non-negative price');
    }

    setSubmitting(true);
    setFormError('');

    try {
      const productPayload = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', // elegant placeholder handloom fabric
        ownerId: user.uid,
        sellerName: user.displayName || user.email?.split('@')[0] || 'Independent Artisan',
        sellerEmail: user.email || '',
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
      };

      if (editingProduct) {
        // Edit flow
        const docRef = doc(db, 'products', editingProduct.id);
        await updateDoc(docRef, productPayload);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), productPayload);
      }

      setIsFormOpen(false);
      fetchMyProducts();
    } catch (error) {
      handleFirestoreError(
        error, 
        editingProduct ? OperationType.UPDATE : OperationType.CREATE, 
        `products/${editingProduct?.id || 'new'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setMyProducts(prev => prev.filter(p => p.id !== productId));
      setIsDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const stats = {
    totalProducts: myProducts.length,
    totalValue: myProducts.reduce((sum, p) => sum + p.price, 0),
    avgPrice: myProducts.length ? myProducts.reduce((sum, p) => sum + p.price, 0) / myProducts.length : 0,
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-maroon-100 rounded-2xl text-center shadow-md">
        <div className="w-16 h-16 bg-maroon-50 flex items-center justify-center rounded-2xl mx-auto mb-6 border border-gold-500/10">
          <Package className="text-maroon-800" size={28} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-maroon-950 mb-2 font-display">Artisan Seller Center</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          Sign in with your Google account to list handloom items, update organic thread details, and track your store statistics.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full bg-maroon-700 text-gold-50 font-medium py-3 rounded-xl hover:bg-maroon-800 transition active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-gold-500/20"
        >
          <Compass size={18} />
          Sign in to Artisan Account
        </button>
        <button 
          onClick={onSwitchToBuyer}
          className="w-full mt-4 bg-transparent text-maroon-700 font-bold py-2 rounded-xl hover:text-saffron-600 text-xs transition cursor-pointer"
        >
          Browse fabrics as Buyer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Upper Brand Promo Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-maroon-100 pb-6 mb-2">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-saffron-600">Handloom Guild Partner</span>
          <h1 className="text-3xl font-bold text-maroon-950 font-display mt-1">Sanskritii Artisan Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your storefront, upload premium items, and monitor listings.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-maroon-700 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-maroon-800 transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer border border-gold-500/20"
        >
          <Plus size={18} />
          Create Weave Listing
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-maroon-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-maroon-50 text-maroon-700 rounded-xl flex items-center justify-center border border-gold-500/10">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Weaves</p>
            <h3 className="text-2xl font-bold text-maroon-950 font-display mt-0.5">{stats.totalProducts} items</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-maroon-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#fffdf0] text-gold-600 rounded-xl flex items-center justify-center border border-gold-500/20">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Portfolio Value</p>
            <h3 className="text-2xl font-bold text-maroon-950 font-display mt-0.5">₹{stats.totalValue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-maroon-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-saffron-50 text-saffron-600 rounded-xl flex items-center justify-center border border-saffron-500/10">
            <BarChart2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Product Price</p>
            <h3 className="text-2xl font-bold text-maroon-950 font-display mt-0.5">₹{stats.avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>
      </div>

      {/* Listing Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-display">My Showcase Inventory</h2>
          <button 
            onClick={fetchMyProducts}
            className="text-xs text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            Sync Live Db
          </button>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            <span className="text-sm">Fetching merchant assets...</span>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Package size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">No products found</h3>
            <p className="text-sm text-slate-500 mb-6">Create a listing to showcase your products on the boutique store!</p>
            <button
              onClick={handleOpenAdd}
              className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition shadow-sm"
            >
              Add first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-[#f8fafc] text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {myProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-medium text-xs">No image</div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 font-display text-base">{product.name}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono select-none">id: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {product.description || <span className="italic text-slate-300">No description provided</span>}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-right text-slate-900 text-base">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setIsDeletingId(product.id)}
                          className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Listing Drawer / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {editingProduct ? 'Update Listing' : 'New Listing'}
                </h2>
                <p className="text-xs text-slate-500">{editingProduct ? 'Modify item properties' : 'Deploy a new product to store'}</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-100">
                  {formError}
                </div>
              )}

              {/* Real-time Card Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                <p className="text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Live Store Preview</p>
                <div className="bg-white p-3 rounded-lg border border-slate-100 max-w-xs mx-auto shadow-xs">
                  <div className="h-28 w-full bg-slate-100 rounded-md overflow-hidden mb-2">
                    {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Aesthetic placeholder</div>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{name || 'Splendid Accent Chair'}</h4>
                  <p className="text-slate-400 scale-95 origin-left text-[10px] truncate mb-1">{description || 'Comfortable premium furniture'}</p>
                  <p className="font-mono font-bold text-slate-900">₹{parseFloat(price || '0').toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Leather Seat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store Price (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Product Image URL</label>
                <input
                  type="url"
                  placeholder="Paste Unsplash image URL or leave blank for auto-icon"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">Accepts any web image format. Unsplash recommended.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the materials, design language, or designer credentials..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-55"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editingProduct ? 'Apply Edit' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Confirm Deletion</h3>
            <p className="text-sm text-slate-500">Are you sure you want to permanently delete this product? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 text-sm font-medium border rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                No, Keep
              </button>
              <button
                onClick={() => handleDelete(isDeletingId)}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
