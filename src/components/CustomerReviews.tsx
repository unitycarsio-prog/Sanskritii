import { useEffect, useState, FormEvent } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { Star, Sparkles, MessageSquare, Check, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError } from '../lib/firebase';
import { OperationType } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { seedReviews } from '../lib/seed';

export interface Review {
  id?: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: string;
}

export default function CustomerReviews() {
  const { user, loginWithGoogle } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      await seedReviews();
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(reviewsData);
    } catch (err) {
      console.warn('Could not load reviews cleanly from Firestore, falling back locally', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to rate our collections');
      return;
    }
    if (!name.trim() || !comment.trim()) {
      setError('Both Name and Review Comment are required');
      return;
    }

    setSubmitting(true);
    setError('');

    const newReview: Omit<Review, 'id'> = {
      name: name.trim(),
      role: role.trim() || 'Verified Curator',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'reviews'), newReview);
      setSubmitSuccess(true);
      setName('');
      setRole('');
      setRating(5);
      setComment('');
      setIsFormOpen(false);
      
      // Refresh list
      await fetchReviews();

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregates
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="bg-white border border-maroon-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 mt-16 font-sans">
      
      {/* Reviews Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-maroon-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-maroon-50 text-maroon-800 border border-gold-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider select-none">
            <Sparkles size={11} className="text-gold-600" />
            Patron Audits
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-maroon-950 font-display">
            Refined Living, Authentic Critiques
          </h3>
          <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
            Unfiltered feedback shared by leading residential architects, interior designers, and fine living connoisseurs across India.
          </p>
        </div>

        {/* Aggregate Metrics Display */}
        <div className="flex items-center gap-4 bg-[#fdfbf7] border border-maroon-100 px-5 py-3 rounded-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-maroon-900 font-display flex items-baseline justify-center gap-1">
              {averageRating}
              <span className="text-[11px] text-maroon-400 font-medium font-sans">/ 5</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
              Avg Rating
            </div>
          </div>
          <div className="h-8 w-px bg-maroon-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-maroon-900 font-display">
              {reviews.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
              Verified Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing review list & form trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Reviews Core Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-transparent animate-spin" />
              <span>Retrieving collector statements...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Be the first to share an audit of our modernist catalog!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div 
                  key={review.id || i}
                  className="bg-[#faf7f2]/40 border border-maroon-100/40 rounded-2xl p-5 hover:shadow-xs transition duration-250 flex flex-col sm:flex-row gap-4 items-start"
                >
                  {/* Miniature Rating Block */}
                  <div className="flex sm:flex-col items-center sm:items-start shrink-0 pt-0.5 gap-1.5 sm:gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={star <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-maroon-700/60 font-mono">
                      {new Date(review.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Body Context */}
                  <div className="space-y-1.5 flex-1 select-text">
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-maroon-950">
                        {review.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {review.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Column Form (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-[#fdfbf6] border border-maroon-100 rounded-2xl p-6 space-y-4 sticky top-6">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-maroon-600" />
                Audit Our Collection
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Registered patrons can log their feedback, ratings, and textile observations directly on our public logs.
              </p>
            </div>

            {submitSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center text-xs space-y-1.5"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 items-center justify-center flex mx-auto">
                  <Check size={16} />
                </div>
                <p className="font-semibold">Review Posted!</p>
                <p className="text-[10px] text-emerald-600">Your review is now public and synced across instances.</p>
              </motion.div>
            )}

            {!submitSuccess && (
              <>
                {!user ? (
                  <div className="border border-maroon-100 bg-white/60 rounded-xl p-4 text-center space-y-3.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Please authenticate to unlock ratings, feedback slips, and secure curated checkout logs.
                    </p>
                    <button
                      onClick={loginWithGoogle}
                      className="w-full py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <LogIn size={13} />
                      Sign In to Post Review
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    {error && (
                      <div className="text-[10px] bg-red-50 text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200">
                        {error}
                      </div>
                    )}

                    {/* Star Rating Selectors */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-maroon-800/80 uppercase tracking-widest block font-sans">
                        Your Rating
                      </label>
                      <div className="flex gap-1.5 pt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-0.5 outline-none transition transform hover:scale-110 cursor-pointer"
                          >
                            <Star 
                              size={18} 
                              className={star <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-amber-500"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-maroon-800/80 uppercase tracking-widest block font-sans">
                        Full Name
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Advait Nair"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-maroon-100 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:border-maroon-700 focus:ring-4 focus:ring-maroon-500/5 outline-none transition font-sans"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-maroon-800/80 uppercase tracking-widest block font-sans">
                        Role / Designation
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Lead Designer, Studio Nair"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white border border-maroon-100 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:border-maroon-700 focus:ring-4 focus:ring-maroon-500/5 outline-none transition font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-maroon-800/80 uppercase tracking-widest block font-sans">
                        Observations / Comment
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Describe the weave texture, thread quality, border weight or color tone..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-white border border-maroon-100 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:border-maroon-700 focus:ring-4 focus:ring-maroon-500/5 outline-none transition resize-none font-sans"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer border border-gold-500/20"
                    >
                      {submitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Submit Verification Audit'
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

      </div>

    </section>
  );
}
