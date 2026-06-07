import { X, Trash2, ShieldCheck, ShoppingBag, ArrowRight, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { OperationType } from '../lib/types';
import { useAuth } from '../context/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, clearCart, cartCount } = useCart();
  const { user, loginAnonymously } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2500 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      // 1. Resolve User Session (use current user, or login anonymously)
      let activeUser = auth.currentUser || user;
      if (!activeUser) {
        await loginAnonymously();
      }

      // Check user again after anonymous login
      const timestamp = new Date().toISOString();
      const finalUid = auth.currentUser?.uid || user?.uid || 'guest-buyer';

      // 1.5 Fetch default address preferences if available from Firestore users collection
      let resolvedAddress = {
        name: auth.currentUser?.displayName || user?.displayName || 'Resident Custodian',
        street: '128 Modernist Avenue',
        city: 'Creative District',
        state: 'CA',
        zip: '90001'
      };

      try {
        const userRef = doc(db, 'users', finalUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.shippingAddress) {
            resolvedAddress = {
              name: userData.name || resolvedAddress.name,
              street: userData.shippingAddress.street || resolvedAddress.street,
              city: userData.shippingAddress.city || resolvedAddress.city,
              state: userData.shippingAddress.state || resolvedAddress.state,
              zip: userData.shippingAddress.zip || resolvedAddress.zip
            };
          }
        }
      } catch (addrErr) {
        console.warn('Could not read user profile address, using template defaults:', addrErr);
      }
      
      // 2. Prepare Order Payload
      const orderPayload = {
        userId: finalUid, // We'll query this via isOwner rules
        total: total,
        status: 'pending',
        createdAt: timestamp,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          quantity: item.quantity
        })),
        shippingAddress: resolvedAddress,
        statusMilestones: [
          { status: 'pending', label: 'Order Placed', time: timestamp, completed: true },
          { status: 'crafting', label: 'Material Sourcing', time: '', completed: false },
          { status: 'shipped', label: 'Artisan Carrier En Route', time: '', completed: false },
          { status: 'out_for_delivery', label: 'Out for Delivery', time: '', completed: false },
          { status: 'delivered', label: 'Home Delivery', time: '', completed: false }
        ]
      };

      // 3. Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      
      // 4. Success State & clear Cart
      clearCart();
      setShowSuccess(true);
    } catch (e: any) {
      console.error(e);
      setCheckoutError('Unable to finalize secure transaction. Please verify database connection.');
      handleFirestoreError(e, OperationType.CREATE, 'orders');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <ShoppingBag size={20} />
              Shopping Basket
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'} selected</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">Purchase Successful</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Thank you for supporting Sanskritii Weaves! Your order has been placed successfully and dispatched to our handloom curators.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="mt-6 bg-slate-900 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-sm w-full"
            >
              Back to Weaves Store
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
            <ShoppingBag size={32} className="text-slate-300" />
            <span className="text-sm">Your basket is currently empty.</span>
            <button
              onClick={onClose}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border border-slate-100 p-3 rounded-xl hover:bg-slate-50/50 transition">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Item</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-slate-900 text-sm truncate font-display">{item.name}</h4>
                    <p className="text-xs text-slate-400 truncate mb-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-red-500 p-1 rounded-md transition"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Checkout Trigger */}
            <div className="border-t border-slate-100 bg-[#f8fafc] p-6 space-y-4">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-slate-950">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono font-medium text-slate-950">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 font-medium">
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition active:scale-98 shadow-sm flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60"
              >
                {checkingOut ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Secure Checkout
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 select-none">
                <ShieldCheck size={12} className="text-emerald-500" />
                Secure checkouts fully simulated in container environment.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
