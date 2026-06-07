import { useState, FormEvent } from 'react';
import { Mail, Shield, FileText, Truck, ShieldAlert, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type PolicyType = 'shipping' | 'refund' | 'privacy' | 'terms' | null;

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all the values before submitting');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'support_inquiries'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'Unread',
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 8000);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setError('Failed to send support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPolicyContent = () => {
    switch (activePolicy) {
      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          icon: <Truck className="text-slate-900" size={24} />,
          text: (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">1. Fast Pan-India Dispatch</p>
              <p>Because our heritage collections are entirely hand-woven by independent authentic Indian weavers, packaging and final finishing audits take 24–48 hours before courier dispatch. Orders are shipped from our design hubs in Banaras and Mumbai.</p>
              
              <p className="font-semibold text-slate-800">2. Delivery Timeframes & Shipping Charges</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-800">Orders above ₹2,000:</strong> Free premium express delivery across India.</li>
                <li><strong className="text-slate-800">Orders below ₹2,000:</strong> Standard flat rate of ₹100.</li>
                <li><strong className="text-slate-800">Metros & Tier 1 Cities:</strong> Securely packed items arrive within 3 to 5 business days.</li>
                <li><strong className="text-slate-800">Tier 2, Tier 3 & Rest of India:</strong> Arrives within 5 to 7 business days.</li>
              </ul>
              
              <p className="font-semibold text-slate-800">3. Ceremonial-Grade Protective Packaging</p>
              <p>Each fine silk saree, hand-block dyed cotton dhoti, or hand-painted raw silk garment is individually wrapped in acid-free preservation paper and tucked into breathable premium cotton duster slips. We ensure they reach your doorstep in pristine, ready-to-wear condition.</p>

              <p className="font-semibold text-slate-800">4. Live Package Tracking</p>
              <p>A persistent SMS and email containing dynamic tracking URLs will be dispatched the moment your order departs our facilities. You can view progress logs or contact our support directly for real-time updates.</p>
            </div>
          )
        };
      case 'refund':
        return {
          title: 'Refund & Returns Policy',
          icon: <ShieldAlert className="text-slate-900" size={24} />,
          text: (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">1. Clean 15-Day Inspection window</p>
              <p>We pride ourselves on the peerless craftsmanship of Sanskritii. If you are not absolutely pleased with the texture, weight, or fit of the garment, you may request a return within 15 calendar days from the date of package delivery.</p>

              <p className="font-semibold text-slate-800">2. Condition Required for Return</p>
              <p>To qualify for an immediate, hassle-free adjustment, returned products must remain in their original unworn state with all designer tags and authentication labels intact. It should not be washed or altered.</p>

              <p className="font-semibold text-slate-800">3. Free Doorstep Reverse Pickups</p>
              <p>Our dispatch partners will safely coordinate a direct tabletop reverse pickup from your registered address in Mumbai, Delhi, Bengaluru, or any major pin code across India at zero additional transport surcharge to you.</p>

              <p className="font-semibold text-slate-800">4. Rapid Refund Dispatch</p>
              <p>Once we inspect the vintage craft to confirm original condition, our finance desk releases a full refund straight to your original source account (NetBanking, UPI, or Credit/Debit Card) within 3 to 5 business days.</p>
            </div>
          )
        };
      case 'privacy':
        return {
          title: 'Privacy & Data Protection Policy',
          icon: <Shield className="text-slate-900" size={24} />,
          text: (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">1. Safe SSL Transactions</p>
              <p>We operate in absolute compliance with Section 43A of India’s Information Technology Act, 2000. All monetary checkouts, addresses, and customer profiles sit behind 256-bit strong bank-grade visual SSL encryption channels. Your real credit cards or UPI details are never processed raw on our servers.</p>

              <p className="font-semibold text-slate-800">2. Collected Customer Data & Purpose</p>
              <p>To safely deliver your handcrafted dhotis, kurtas, or fine silk sarees, we record minimal operational indicators: receiver name, delivery address, communication email address, and order history notes. We never monetize, lend, or syndicate this data to third-party advertisers.</p>

              <p className="font-semibold text-slate-800">3. Firebase Firestore Security</p>
              <p>Our app writes customer baskets, wishlists, and user profiles directly to sandboxed Google Cloud Firestore instances, strictly validated via Sanskritii secure credential protocols so only authenticated accounts can view private histories.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText className="text-slate-900" size={24} />,
          text: (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">1. Artisanal Marketplace Scope</p>
              <p>Sanskritii functions as an exclusive, closed-loop hub connecting verified premium independent Indian weavers with traditional attire connoisseurs. By interacting with the site, buying, or listing items, you agree to these clear operational terms.</p>

              <p className="font-semibold text-slate-800">2. Accurate Product Pricing & Catalog Information</p>
              <p>All catalog elements are displayed in Indian Rupees (₹) including all relevant transactional taxes. Artisan listings contain genuine, high-definition photography representing original physical wares. Slight variations in clay pottery glaze, oak grain lines, or weave threads are natural signs of artisanal luxury.</p>

              <p className="font-semibold text-slate-800">3. Proprietary Material Protection</p>
              <p>Design imagery, copy, clothing motifs, and our brand logo elements are sole trademarks of Sanskritii. Unauthorized commercial reproduction of listed wares is strictly prohibited.</p>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const policyMeta = getPolicyContent();

  return (
    <footer className="bg-maroon-950 text-slate-300 border-t border-maroon-900 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-maroon-900">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              {/* Custom crafted royal golden lotus logo emblem representing traditional luxury */}
              <svg className="w-9 h-9 text-gold-500 drop-shadow-md select-none transform hover:rotate-6 transition duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="44" fill="#801b22" stroke="#d4af37" strokeWidth="3" />
                <circle cx="50" cy="50" r="39" stroke="#d4af37" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <path d="M50 16 C43 32 25 45 50 84 C75 45 57 32 50 16 Z" fill="#d4af37" opacity="0.95" />
                <path d="M50 25 C35 38 10 52 50 82 C90 52 65 38 50 25 Z" fill="#b89122" opacity="0.75" />
                <path d="M50 34 C42 45 25 55 50 76 C75 55 58 45 50 34 Z" fill="#96252d" />
                <circle cx="50" cy="55" r="5" fill="#facc15" />
                <circle cx="50" cy="55" r="2" fill="#faf1f2" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Sanskritii
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              Heritage-grade traditional Indian handloom dhotis, raw silk kurtas, double Kasavu mundus, and divine festival wear. Woven with organic threads directly by master craftsmen across historical Indian weaving hubs.
            </p>
            <div className="pt-2 text-xs text-maroon-400/60 font-mono">
              © 2026 Sanskritii Private Limited. Delhi / Mumbai / Varanasi.
            </div>
          </div>

          {/* Guidelines & Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-100 font-sans">
              Store Information & Policies
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs text-slate-400 font-medium">
              <button 
                onClick={() => setActivePolicy('shipping')} 
                className="text-left hover:text-white transition flex items-center gap-2"
              >
                <Truck size={14} className="text-slate-500" />
                Shipping & Delivery Policy
              </button>
              <button 
                onClick={() => setActivePolicy('refund')} 
                className="text-left hover:text-white transition flex items-center gap-2"
              >
                <ShieldAlert size={14} className="text-slate-500" />
                Refund & Return Terms
              </button>
              <button 
                onClick={() => setActivePolicy('privacy')} 
                className="text-left hover:text-white transition flex items-center gap-2"
              >
                <Shield size={14} className="text-slate-500" />
                Privacy & Payment Security
              </button>
              <button 
                onClick={() => setActivePolicy('terms')} 
                className="text-left hover:text-white transition flex items-center gap-2"
              >
                <FileText size={14} className="text-slate-500" />
                Terms & Conditions
              </button>
            </div>
            
            <div className="pt-2">
              <p className="text-[11px] text-slate-500 lowercase">
                Direct customer desk response guaranteed within 12 hours.
              </p>
            </div>
          </div>

          {/* Interactive Live Contact Inquiry Desk (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-100 font-sans">
                Contact & Live Support Desk
              </h4>
              <p className="text-[11px] text-slate-400">
                Facing challenges or looking for customized listings? Reach us directly below.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-3">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/40 border border-emerald-500/35 p-3 rounded-xl text-center"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center flex mx-auto mb-1.5">
                    <Check size={14} />
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-300">Inquiry Sent Successfully!</p>
                  <p className="text-[10px] text-slate-400 mt-1">We will reach out to you or copy <span className="text-slate-300 font-semibold">unitycarsio@gmail.com</span>.</p>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <div className="text-[10px] text-red-400 font-medium bg-red-950/25 px-2.5 py-1.5 rounded-lg border border-red-500/10">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-maroon-900/60 border border-maroon-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-maroon-400 focus:border-gold-500 outline-none transition"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-maroon-900/60 border border-maroon-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-maroon-400 focus:border-gold-500 outline-none transition"
                      required
                    />
                  </div>

                  <textarea 
                    rows={2}
                    placeholder="Describe your design specifications or query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-maroon-900/60 border border-maroon-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-maroon-400 focus:border-gold-500 outline-none transition resize-none"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-saffron-600 hover:bg-saffron-700 text-gold-50 font-bold text-xs transition duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-gold-500/20"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail size={12} className="text-gold-300" />
                        Submit Secure Support Form
                      </>
                    )}
                  </button>
                </>
              )}
            </form>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="font-semibold text-white">Direct Email:</span> 
                <a href="mailto:unitycarsio@gmail.com" className="text-[#facc15] hover:underline font-mono">
                  unitycarsio@gmail.com
                </a>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Store Location: Bandra West, Mumbai, MH - India
              </div>
            </div>

          </div>

        </div>

        {/* Lower aesthetic foot banner */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 space-y-3 sm:space-y-0">
          <div>
            100% Secure Checkout with Razorpay & UPI. Powered by Google Cloud Firestore.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => setActivePolicy('privacy')}>Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => setActivePolicy('terms')}>Terms</span>
            <span>•</span>
            <a href="mailto:unitycarsio@gmail.com" className="hover:text-slate-300">Support</a>
          </div>
        </div>

      </div>

      {/* Slide-Up Overlays for Policy and Terms viewing (AnimatePresence) */}
      <AnimatePresence>
        {activePolicy && policyMeta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicy(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22 }}
              className="relative max-w-lg w-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    {policyMeta.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-display">
                    {policyMeta.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setActivePolicy(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition"
                  aria-label="Close policy"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Document Text */}
              <div className="overflow-y-auto flex-1 pr-1 font-sans">
                {policyMeta.text}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between shrink-0">
                <div className="text-[10px] text-slate-400 font-mono">
                  Effective date: June 2026
                </div>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wide transition shadow-xs"
                >
                  I Understand
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}
