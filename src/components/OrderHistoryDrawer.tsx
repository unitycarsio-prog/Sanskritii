import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { OperationType } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { 
  X, User, MapPin, Package, Truck, CheckCircle, Calendar, Star, 
  ChevronRight, AlertCircle, RefreshCcw, Landmark, ClipboardList, Info
} from 'lucide-react';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface StatusMilestone {
  status: string;
  label: string;
  time: string;
  completed: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  quantity: number;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  statusMilestones: StatusMilestone[];
}

export default function OrderHistoryDrawer({ isOpen, onClose }: OrderHistoryDrawerProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile settings
  const [profileName, setProfileName] = useState('');
  const [prefStreet, setPrefStreet] = useState('128 Modernist Lane, Bandra West');
  const [prefCity, setPrefCity] = useState('Mumbai');
  const [prefState, setPrefState] = useState('MH');
  const [prefZip, setPrefZip] = useState('400050');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Active view tabs: 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Selected order for full-page status detail view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Ratings form state
  const [ratingTargetItemId, setRatingTargetItemId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Carrier logistics console expansion helper
  const [showLogisticsConsole, setShowLogisticsConsole] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOrdersAndProfile();
    } else {
      setSelectedOrder(null);
      setRatingTargetItemId(null);
      setShowLogisticsConsole(false);
    }
  }, [isOpen, user]);

  const fetchOrdersAndProfile = async () => {
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (!activeUid) return;

    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch user profile address if saved in `/users/{userId}`
      const userRef = doc(db, 'users', activeUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileName(data.name || auth.currentUser?.displayName || user?.displayName || '');
        if (data.shippingAddress) {
          setPrefStreet(data.shippingAddress.street || '');
          setPrefCity(data.shippingAddress.city || '');
          setPrefState(data.shippingAddress.state || '');
          setPrefZip(data.shippingAddress.zip || '');
        }
      } else {
        setProfileName(auth.currentUser?.displayName || user?.displayName || 'Resident Guardian');
      }

      // 2. Fetch past orders safely filtered by `userId` to comply with Firestore secure rules
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', activeUid));
      const querySnapshot = await getDocs(q);
      
      const ordersData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }) as Order);

      // Sort client-side to keep queries lightweight & avoid demanding custom Firestore indices
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(ordersData);

      // Keep selected order in sync if it is currently open
      if (selectedOrder) {
        const updatedSelected = ordersData.find(o => o.id === selectedOrder.id);
        if (updatedSelected) {
          setSelectedOrder(updatedSelected);
        }
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setErrorMsg('Failed to sync past purchases. Verify database state & authorization attributes.');
      handleFirestoreError(err, OperationType.LIST, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const activeUid = auth.currentUser?.uid || user?.uid;
    if (!activeUid) return;

    setSavingProfile(true);
    setProfileSavedSuccess(false);
    try {
      const userRef = doc(db, 'users', activeUid);
      await setDoc(userRef, {
        uid: activeUid,
        name: profileName,
        shippingAddress: {
          street: prefStreet,
          city: prefCity,
          state: prefState,
          zip: prefZip
        }
      }, { merge: true });

      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error conserving user attributes.');
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSimulateMilestone = async (nextStatus: string, label: string) => {
    if (!selectedOrder) return;

    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      
      // Update statusMilestones with timestamp
      const updatedMilestones = selectedOrder.statusMilestones.map(m => {
        if (m.status === nextStatus) {
          return { ...m, completed: true, time: new Date().toISOString() };
        }
        // If advancing to a late milestone, make sure earlier ones are also completed
        const milestoneIndex = selectedOrder.statusMilestones.findIndex(x => x.status === nextStatus);
        const currentIndex = selectedOrder.statusMilestones.findIndex(x => x.status === m.status);
        if (currentIndex < milestoneIndex) {
          return { ...m, completed: true, time: m.time || new Date().toISOString() };
        }
        return m;
      });

      await updateDoc(orderRef, {
        status: nextStatus,
        statusMilestones: updatedMilestones
      });

      // Optimistically update local UI immediately
      const refreshedOrder = {
        ...selectedOrder,
        status: nextStatus,
        statusMilestones: updatedMilestones
      };
      setSelectedOrder(refreshedOrder);
      
      // Sync list
      await fetchOrdersAndProfile();
    } catch (err: any) {
      console.error('Error advancing milestone:', err);
      setErrorMsg('Unauthorized state manipulation or network breakdown.');
      handleFirestoreError(err, OperationType.UPDATE, `orders/${selectedOrder.id}`);
    }
  };

  const handleSubmitReview = async (itemId: string) => {
    if (!selectedOrder) return;

    setSubmittingReview(true);
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      
      const updatedItems = selectedOrder.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            review: {
              rating: ratingStars,
              comment: ratingComment,
              createdAt: new Date().toISOString()
            }
          };
        }
        return item;
      });

      await updateDoc(orderRef, {
        items: updatedItems
      });

      // Optimistic update
      const refreshedOrder = {
        ...selectedOrder,
        items: updatedItems
      };
      setSelectedOrder(refreshedOrder);
      setRatingTargetItemId(null);
      setRatingStars(5);
      setRatingComment('');

      await fetchOrdersAndProfile();
    } catch (err: any) {
      console.error('Error reviewing item:', err);
      setErrorMsg('Failed to preserve product feedback structure.');
      handleFirestoreError(err, OperationType.UPDATE, `orders/${selectedOrder.id}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'crafting': 
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'shipped': 
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'out_for_delivery': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'delivered': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: 
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Placed';
      case 'crafting': return 'Sourcing';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in font-sans">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-slide-in-right relative">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <User size={20} className="text-slate-800" />
              Buyer Profile & Orders
            </h2>
            <p className="text-xs text-slate-500">
              {auth.currentUser?.isAnonymous ? 'Guest Client Profile' : 'Verified Artisan Account'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tab Controls */}
        {!selectedOrder && (
          <div className="px-6 border-b border-slate-100 flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'orders' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'profile' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Default Address Preferences
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="m-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-pulse">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedOrder ? (
            /* ================= SELECTED ORDER STATUS DETAIL VIEW ================= */
            <div className="p-6 space-y-6">
              {/* Back to Orders arrow */}
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setRatingTargetItemId(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-950 flex items-center gap-1 transition"
              >
                &larr; Back to purchase history
              </button>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Order ID</span>
                  <span className="font-mono text-xs text-slate-800 font-medium">{selectedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Placed Date</span>
                  <span className="text-xs text-slate-800 font-medium font-sans">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Purchase</span>
                  <span className="font-mono text-sm font-bold text-slate-950">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Milestone Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 font-display flex items-center gap-1.5">
                  <Truck size={14} />
                  Delivery Tracking
                </h3>
                
                <div className="space-y-4 relative pl-6 border-l border-slate-200 ml-3">
                  {selectedOrder.statusMilestones.map((milestone, idx) => {
                    const isUpcoming = !milestone.completed;
                    return (
                      <div key={milestone.status} className="relative">
                        {/* Bullet indicators */}
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                          milestone.completed 
                            ? 'border-slate-905 bg-slate-950 text-white' 
                            : 'border-slate-200'
                        }`}>
                          {milestone.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-semibold ${milestone.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {milestone.label}
                          </h4>
                          {milestone.completed && milestone.time ? (
                            <p className="text-[10px] text-slate-400">
                              Completed: {new Date(milestone.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400">Pending arrival</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Artisan logistics simulation controls - NEW FEATURE */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
                <button
                  onClick={() => setShowLogisticsConsole(!showLogisticsConsole)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  <span className="flex items-center gap-1.5 font-display">
                    <Info size={14} className="text-slate-400" />
                    Artisan Logistics Control
                  </span>
                  <span className="text-slate-400">{showLogisticsConsole ? 'Hide' : 'Expand'}</span>
                </button>

                {showLogisticsConsole && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-2">
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Simulate the backend artisan hand-crafting and carrier dispatch steps in real-time. Each state change writing seamlessly to Firestore.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleSimulateMilestone('crafting', 'Material Sourcing')}
                        disabled={selectedOrder.status === 'crafting' || selectedOrder.statusMilestones.find(m => m.status === 'crafting')?.completed}
                        className="bg-white text-[11px] font-semibold border border-slate-200 rounded-lg p-2 hover:border-slate-900 hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
                      >
                        Start Sourcing Wares
                      </button>
                      <button
                        onClick={() => handleSimulateMilestone('shipped', 'Artisan Carrier En Route')}
                        disabled={selectedOrder.status === 'shipped' || selectedOrder.statusMilestones.find(m => m.status === 'shipped')?.completed}
                        className="bg-white text-[11px] font-semibold border border-slate-200 rounded-lg p-2 hover:border-slate-900 hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
                      >
                        Hand Over to Courier
                      </button>
                      <button
                        onClick={() => handleSimulateMilestone('out_for_delivery', 'Out for Delivery')}
                        disabled={selectedOrder.status === 'out_for_delivery' || selectedOrder.statusMilestones.find(m => m.status === 'out_for_delivery')?.completed}
                        className="bg-white text-[11px] font-semibold border border-slate-200 rounded-lg p-2 hover:border-slate-900 hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
                      >
                        Courier Final Delivery
                      </button>
                      <button
                        onClick={() => handleSimulateMilestone('delivered', 'Home Delivery')}
                        disabled={selectedOrder.status === 'delivered' || selectedOrder.statusMilestones.find(m => m.status === 'delivered')?.completed}
                        className="bg-white text-[11px] font-semibold border border-slate-200 rounded-lg p-2 hover:border-slate-900 hover:bg-slate-50 text-slate-755 disabled:opacity-40 transition"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Purchased in this order */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Package size={14} />
                  Ordered Wares
                </h3>

                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 bg-white hover:bg-slate-50/50 transition duration-200">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-300">Wares</div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-slate-400 truncate mb-1">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs mt-1 text-slate-500">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span className="font-mono font-medium">₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review Module - NEW FEATURE */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {item.review ? (
                          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-xs">
                            <div className="flex items-center gap-1 mb-1 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11} fill={i < item.review!.rating ? 'currentColor' : 'none'} />
                              ))}
                              <span className="text-[10px] text-slate-400 ml-1 font-mono">
                                {new Date(item.review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 font-sans italic leading-relaxed">"{item.review.comment}"</p>
                          </div>
                        ) : ratingTargetItemId === item.id ? (
                          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-slide-in-top">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Your Star Rating</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setRatingStars(star)}
                                    className="text-amber-400 hover:scale-110 transition"
                                  >
                                    <Star size={16} fill={star <= ratingStars ? 'currentColor' : 'none'} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Review Comments</label>
                              <textarea
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                placeholder="Share your experience with this design..."
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-slate-800 transition"
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-xs pt-1">
                              <button
                                onClick={() => setRatingTargetItemId(null)}
                                className="px-3 py-1.5 text-slate-500 hover:text-slate-900 font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReview(item.id)}
                                disabled={submittingReview}
                                className="bg-slate-950 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-850 disabled:opacity-50 transition"
                              >
                                {submittingReview ? 'Preserving...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRatingTargetItemId(item.id);
                              setRatingStars(5);
                              setRatingComment('');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition"
                          >
                            <Star size={13} strokeWidth={2.5} />
                            Write a review for this ware
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* ================= ORDERS HISTORY TAB ================= */
            <div className="p-6">
              {loading ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Gathering historic transactions...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-24 text-center max-w-xs mx-auto space-y-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">No past orders yet</h4>
                    <p className="text-xs text-slate-500 mt-1">Ready items in your shopping basket to trigger a secure container checkout sequence.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="border border-slate-100/80 bg-white p-4 rounded-2xl hover:bg-slate-50/60 transition duration-200 cursor-pointer shadow-xs relative overflow-hidden group border-l-2 hover:border-l-slate-900"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] text-slate-400">#{order.id.slice(0, 10)}...</span>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border tracking-wide select-none ${getStatusBadgeClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Wares preview thumbnail line */}
                        <div className="flex items-center gap-2 overflow-hidden py-1">
                          {order.items.slice(0, 3).map((it, i) => (
                            <div key={i} className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              <img src={it.imageUrl} alt="preview" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
                              +{order.items.length - 3}
                            </div>
                          )}
                          <span className="text-xs text-slate-500 truncate ml-2 font-display">
                            {order.items.length} {order.items.length === 1 ? 'ware' : 'wares'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar size={11} />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
                            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-all group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ================= DEFAULT ADDRESS PREFERENCES TAB ================= */
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-3">
                Configure your default shipping parameters. These settings will automatically align as pre-populated values for all future cart checkout sessions.
              </p>

              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Courier Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 transition outline-none"
                    placeholder="E.g. Priya Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Street Address</label>
                  <input
                    type="text"
                    value={prefStreet}
                    onChange={(e) => setPrefStreet(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 transition outline-none"
                    placeholder="E.g. 128 Modernist Lane, Bandra West"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">City</label>
                    <input
                      type="text"
                      value={prefCity}
                      onChange={(e) => setPrefCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 transition outline-none"
                      placeholder="E.g. Mumbai"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">State</label>
                    <input
                      type="text"
                      value={prefState}
                      onChange={(e) => setPrefState(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 transition outline-none"
                      placeholder="E.g. MH"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">ZIP Code</label>
                    <input
                      type="text"
                      value={prefZip}
                      onChange={(e) => setPrefZip(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 transition outline-none"
                      placeholder="E.g. 400050"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full mt-2 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 text-xs transition disabled:opacity-55"
                >
                  {savingProfile ? 'Updating database...' : 'Conserve Default Parameters'}
                </button>

                {profileSavedSuccess && (
                  <p className="text-[11px] text-emerald-600 text-center font-bold animate-pulse">
                    ✓ Default address conserved successfully.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info/controls */}
        {!selectedOrder && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Artisanal logistics synchronized</span>
            <button
              onClick={fetchOrdersAndProfile}
              disabled={loading}
              title="Sync purchases"
              className="text-slate-400 hover:text-slate-900 flex items-center gap-1 text-[11px] font-semibold transition"
            >
              <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
              Sync ledger
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
