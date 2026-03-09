import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tag, 
  Hotel, 
  Ship, 
  ChevronLeft, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Percent
} from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  type: 'hotel' | 'transport' | 'all';
  image: string;
  expiry: string;
  code: string;
  color: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: "Summer Escape at Raffles",
    description: "Enjoy a luxurious stay with 25% off on all suites including breakfast for two.",
    discount: "25% OFF",
    type: 'hotel',
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
    expiry: "Ends in 12 days",
    code: "RAFFLES25",
    color: "bg-blue-600"
  },
  {
    id: 2,
    title: "Island Hopper Special",
    description: "Book your round-trip ferry to Koh Rong and get a free upgrade to VIP seating.",
    discount: "FREE UPGRADE",
    type: 'transport',
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
    expiry: "Ends in 5 days",
    code: "ISLANDVIP",
    color: "bg-emerald-600"
  },
  {
    id: 3,
    title: "Angkor Wat Sunrise Tour",
    description: "Early bird promotion! Book 30 days in advance and save 15% on private tours.",
    discount: "15% OFF",
    type: 'all',
    image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800",
    expiry: "Limited time",
    code: "SUNRISE15",
    color: "bg-orange-600"
  },
  {
    id: 4,
    title: "Mondulkiri Eco-Stay",
    description: "Stay 3 nights and pay for 2 at our partner eco-lodges in the jungle.",
    discount: "STAY 3 PAY 2",
    type: 'hotel',
    image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=800",
    expiry: "Ends in 20 days",
    code: "ECOSTAY",
    color: "bg-cyan-600"
  },
  {
    id: 5,
    title: "Private Car Transfer",
    description: "10% discount on all private car transfers between Phnom Penh and Siem Reap.",
    discount: "10% OFF",
    type: 'transport',
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
    expiry: "Ongoing",
    code: "TRANSFER10",
    color: "bg-indigo-600"
  },
  {
    id: 6,
    title: "Kep Crab Market Feast",
    description: "Exclusive voucher for a free seafood platter with any hotel booking in Kep.",
    discount: "FREE PLATTER",
    type: 'hotel',
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
    expiry: "Ends in 8 days",
    code: "KEPFEAST",
    color: "bg-red-600"
  }
];

interface PromotionsProps {
  onBack: () => void;
  onClaim: () => void;
}

export const Promotions: React.FC<PromotionsProps> = ({ onBack, onClaim }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hotel' | 'transport'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPromotions = promotions.filter(p => 
    activeFilter === 'all' ? true : p.type === activeFilter
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-14">
        <div className="max-w-7xl mx-auto relative min-h-[500px] md:h-[620px] rounded-[3rem] overflow-hidden flex items-end">
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2200"
              alt="Luxury Promotion Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/35 to-slate-900/80" />
          </motion.div>

          <div className="relative z-10 p-8 md:p-14 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.25em] mb-6">
                <Percent className="w-3.5 h-3.5" />
                Limited-Time Offers
              </span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[0.92] tracking-tight mb-5">
                Promotions for Your
                <br />
                <span className="font-serif italic font-light">Next Booking</span>
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl mb-8">
                Unlock member prices, bundle deals, and seasonal discounts inspired by the Home experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 max-w-4xl"
            >
              <button
                onClick={() => {
                  setActiveFilter('hotel');
                  document.getElementById('promo-results')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 bg-white text-slate-900 hover:bg-blue-50 px-6 py-4 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Hotel className="w-4 h-4" />
                Hotel Deals
              </button>
              <button
                onClick={() => {
                  setActiveFilter('transport');
                  document.getElementById('promo-results')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 bg-slate-900/40 text-white hover:bg-slate-900/55 px-6 py-4 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/20"
              >
                <Ship className="w-4 h-4" />
                Transport Deals
              </button>
              <div className="px-5 py-3 rounded-2xl border border-white/20 text-center">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Active Promotions</p>
                <p className="text-white text-xl font-bold">{filteredPromotions.length}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="hidden md:block">
              {/* Spacer for layout consistency */}
            </div>
            
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              {(['all', 'hotel', 'transport'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                    activeFilter === filter 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div id="promo-results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPromotions.map((promo) => (
              <motion.div
                key={promo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={promo.image} 
                    alt={promo.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-6 left-6">
                    <span className={`${promo.color} text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                      <Percent className="w-3 h-3" /> {promo.discount}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">
                      {promo.type === 'hotel' ? <Hotel className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                      {promo.type} PROMOTION
                    </div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{promo.title}</h3>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                    {promo.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                    <Clock className="w-3.5 h-3.5" />
                    {promo.expiry}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{promo.code}</span>
                        <button 
                          onClick={() => handleCopyCode(promo.code)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          {copiedCode === promo.code ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={onClaim}
                      className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      Claim Now
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Newsletter / More Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-blue-600 rounded-[3rem] p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Tag className="w-12 h-12 text-white/20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              {isSubscribed ? 'Welcome to the club!' : 'Never miss a deal again'}
            </h2>
            <p className="text-blue-100 mb-8">
              {isSubscribed 
                ? "Thank you for subscribing! You'll be the first to receive our exclusive offers." 
                : "Subscribe to our newsletter and be the first to know about exclusive discounts, early bird offers, and seasonal sales."}
            </p>
            
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center justify-center gap-3 text-white font-bold"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Subscription Active
              </motion.div>
            )}
            
            {!isSubscribed && (
              <p className="text-[10px] text-blue-200 mt-6 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> No spam, only the best deals. Unsubscribe anytime.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
