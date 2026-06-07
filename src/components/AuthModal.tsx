import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

// Exactly 45 high-quality, themed avatar portrait options representing Sanskritii personas/weavers/connoisseurs
const AVATAR_POOL = [
  { id: 'av1', name: 'Banaras Swarna Sari', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&h=120&fit=crop&q=80' },
  { id: 'av2', name: 'Patron Devotee', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&q=80' },
  { id: 'av3', name: 'Master Craftsman', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&q=80' },
  { id: 'av4', name: 'Royal Patron', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80' },
  { id: 'av5', name: 'Saree Connoisseur', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80' },
  { id: 'av6', name: 'Silk Merchant', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&q=80' },
  { id: 'av7', name: 'Swadeshi Designer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&q=80' },
  { id: 'av8', name: 'Varanasi Weaver', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&q=80' },
  { id: 'av9', name: 'Kerala Kasavu Enthusiast', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&q=80' },
  { id: 'av10', name: 'Handloom Scholar', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&h=120&fit=crop&q=80' },
  { id: 'av11', name: 'Jaipur Block Artisan', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&q=80' },
  { id: 'av12', name: 'Heritage Curator', url: 'https://images.unsplash.com/photo-1534751516642-a131ffa1039f?w=120&h=120&fit=crop&q=80' },
  { id: 'av13', name: 'Textile Collector', url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&h=120&fit=crop&q=80' },
  { id: 'av14', name: 'Silk Thread Innovator', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&q=80' },
  { id: 'av15', name: 'Zari Designer', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&h=120&fit=crop&q=80' },
  { id: 'av16', name: 'Festival Draping Expert', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&q=80' },
  { id: 'av17', name: 'Khadi Patron', url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f4d3?w=120&h=120&fit=crop&q=80' },
  { id: 'av18', name: 'Ganga Sunset Weaver', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&q=80' },
  { id: 'av19', name: 'Mandapam Priest', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80' },
  { id: 'av20', name: 'Carnatic Vocalist', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&q=80' },
  { id: 'av21', name: 'Balaramapuram Guild Chief', url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&q=80' },
  { id: 'av22', name: 'Chanderi Artisan', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&h=120&fit=crop&q=80' },
  { id: 'av23', name: 'Valkalam Scholar', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&q=80' },
  { id: 'av24', name: 'Handspun Devotee', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&q=80' },
  { id: 'av25', name: 'Traditional Model', url: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=120&h=120&fit=crop&q=80' },
  { id: 'av26', name: 'Madras Check Stylist', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop&q=80' },
  { id: 'av27', name: 'Indore Maheshwari Weaver', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&h=120&fit=crop&q=80' },
  { id: 'av28', name: 'Organic Thread Expert', url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=120&h=120&fit=crop&q=80' },
  { id: 'av29', name: 'Kalamkari Painter', url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda168?w=120&h=120&fit=crop&q=80' },
  { id: 'av30', name: 'Ikat Innovator', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&h=120&fit=crop&q=80' },
  { id: 'av31', name: 'Dhoti Connoisseur', url: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?w=120&h=120&fit=crop&q=80' },
  { id: 'av32', name: 'Sufi Raw Silk Designer', url: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=120&h=120&fit=crop&q=80' },
  { id: 'av33', name: 'Tussar Silk Merchant', url: 'https://images.unsplash.com/photo-1514543250559-83867827ecce?w=120&h=120&fit=crop&q=80' },
  { id: 'av34', name: 'Sambalpuri Weaver', url: 'https://images.unsplash.com/photo-1524250502761-136f6fa65d3e?w=120&h=120&fit=crop&q=80' },
  { id: 'av35', name: 'Temple Wear Specialist', url: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c684a?w=120&h=120&fit=crop&q=80' },
  { id: 'av36', name: 'Indigo Dyer', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&h=120&fit=crop&q=80' },
  { id: 'av37', name: 'Ajrakh Block Weaver', url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=120&h=120&fit=crop&q=80' },
  { id: 'av38', name: 'Phulkari Embroiderer', url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&h=120&fit=crop&q=80' },
  { id: 'av39', name: 'Zardozi Thread Master', url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=120&h=120&fit=crop&q=80' },
  { id: 'av40', name: 'Kandangi Saree Weaver', url: 'https://images.unsplash.com/photo-1553514029-1318c9127859?w=120&h=120&fit=crop&q=80' },
  { id: 'av41', name: 'Eri Silk Harvester', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&h=120&fit=crop&q=80' },
  { id: 'av42', name: 'Pochampally Mentor', url: 'https://images.unsplash.com/photo-1579038773867-044c48829161?w=120&h=120&fit=crop&q=80' },
  { id: 'av43', name: 'Dharmavaram Weaver', url: 'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?w=120&h=120&fit=crop&q=80' },
  { id: 'av44', name: 'Jamdani Specialist', url: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=120&h=120&fit=crop&q=80' },
  { id: 'av45', name: 'Kota Doria Curator', url: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=120&h=120&fit=crop&q=80' }
];

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, loginCredentials, registerCredentials } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [uid, setUid] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_POOL[0].url);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanUid = uid.trim().toLowerCase();
      if (!cleanUid) {
        throw new Error('Please enter a unique authentication ID.');
      }
      if (!password) {
        throw new Error('Please enter your secure access password.');
      }

      if (isSignUp) {
        const cleanName = displayName.trim();
        if (!cleanName) {
          throw new Error('Please enter your full name for the artisan register.');
        }
        await registerCredentials(cleanUid, cleanName, selectedAvatar, password);
      } else {
        await loginCredentials(cleanUid, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication operation failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-maroon-950/60 backdrop-blur-md z-55 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-gold-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        
        {/* Core Header */}
        <div className="sticky top-0 bg-white border-b border-maroon-155 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <svg className="w-8 h-8 text-gold-540" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="44" fill="#801b22" stroke="#d4af37" strokeWidth="3" />
              <path d="M50 16 C43 32 25 45 50 84 C75 45 57 32 50 16 Z" fill="#d4af37" />
              <circle cx="50" cy="55" r="4" fill="#faf1f2" />
            </svg>
            <div>
              <h2 className="text-xl font-display font-bold text-maroon-950">
                {isSignUp ? 'Artisan Swadeshi Sign Up' : 'Patron Credentials Sign In'}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide">SANSKRITII SECURE VAULT</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setAuthModalOpen(false);
              setError(null);
            }}
            className="p-1.5 rounded-full hover:bg-maroon-50 text-slate-400 hover:text-maroon-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 rounded-xl text-xs space-y-1">
              <span className="font-bold block text-[13px]">Strict Validation Alert</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 p-1.5 bg-maroon-50/60 rounded-2xl border border-maroon-100">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isSignUp 
                  ? 'bg-maroon-700 text-white shadow-md border border-gold-500/20' 
                  : 'text-maroon-800 hover:text-maroon-950'
              }`}
            >
              Credentials Access (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isSignUp 
                  ? 'bg-maroon-700 text-white shadow-md border border-gold-500/20' 
                  : 'text-maroon-800 hover:text-maroon-950'
              }`}
            >
              Create Account (Register)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Input fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-maroon-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={12} className="text-saffron-600" />
                  Your Unique UID (Required)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. aryaveer99, weaver_benares"
                  value={uid}
                  onChange={(e) => setUid(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-maroon-700 focus:ring-4 focus:ring-maroon-500/5 outline-none transition font-mono"
                  required
                />
                <span className="text-[9px] text-slate-400 block leading-tight">
                  Only alphanumeric, hyphens, and underscores. Everyone must have a unique UID.
                </span>
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-maroon-900 uppercase tracking-wider">
                    Full Name / Artisan Guild Name
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Aryaveer Prasad"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-maroon-700 outline-none transition"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-maroon-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-saffron-600" />
                  Access Password
                </label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-maroon-700 outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-maroon-750 hover:bg-maroon-800 text-gold-50 font-bold rounded-2xl transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-gold-500/35 uppercase text-xs tracking-wider"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} className="text-gold-400" />
                    {isSignUp ? 'Finalize Artisan Register' : 'Access Sanskritii Account'}
                  </>
                )}
              </button>
            </div>

            {/* Avatar Picker Column (Visible during SignUp, or just showing active one during Sign In) */}
            <div className="space-y-4">
              {isSignUp ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-maroon-900 uppercase tracking-wider block">
                    Choose Traditional Avatar Persona (40+ Options)
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-maroon-100">
                      <img 
                        src={selectedAvatar} 
                        className="w-12 h-12 rounded-full border-2 border-gold-500 shadow-sm object-cover" 
                        alt="Selected persona representation" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest leading-none">Selected</p>
                        <p className="text-xs font-bold text-maroon-900 mt-1">
                          {AVATAR_POOL.find(a => a.url === selectedAvatar)?.name || 'Sanskritii Patron'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Render grid of 45 avatars */}
                    <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {AVATAR_POOL.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.url)}
                          title={avatar.name}
                          className={`relative aspect-square rounded-full overflow-hidden border-2 transition transform hover:scale-105 cursor-pointer ${
                            selectedAvatar === avatar.url 
                              ? 'border-maroon-700 ring-2 ring-saffron-500' 
                              : 'border-slate-200 hover:border-maroon-400'
                          }`}
                        >
                          <img 
                            src={avatar.url} 
                            alt={avatar.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-maroon-50/40 rounded-2xl p-5 border border-maroon-100/50 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-maroon-700 border-2 border-gold-400 flex items-center justify-center mx-auto text-gold-300">
                    <HelpCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-maroon-950 font-display">Need a Demo Credentials account?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mt-1">
                      Click the <strong className="text-maroon-800">Create Account</strong> tab to sign up programmatically with your custom unique UID & access password instantly!
                    </p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </form>

        {/* Info Footer */}
        <div className="bg-slate-50 p-4 text-center rounded-b-3xl border-t border-slate-100">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck size={11} className="text-emerald-600" />
            Encryption and Credentials managed securely under Swadeshi sandboxed storage protocols.
          </p>
        </div>

      </div>
    </div>
  );
}
