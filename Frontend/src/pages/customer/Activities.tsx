import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  Waves, 
  Fish, 
  Utensils, 
  Tent, 
  Compass, 
  Camera,
  Info,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityOption {
  id: number;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
}

const activityOptions: ActivityOption[] = [
  {
    id: 1,
    name: 'Swimming',
    price: 50,
    description: 'Access to heated pool and private beach area.',
    icon: <Waves className="w-5 h-5" />
  },
  {
    id: 2,
    name: 'Fishing',
    price: 75,
    description: 'Equipment rental and local guide for 4 hours.',
    icon: <Fish className="w-5 h-5" />
  },
  {
    id: 3,
    name: 'BBQ / Food',
    price: 40,
    description: 'Ready-to-grill meat and veggie pack.',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 4,
    name: 'Camping',
    price: 100,
    description: 'Full tent set-up under the stars.',
    icon: <Tent className="w-5 h-5" />
  },
  {
    id: 5,
    name: 'Tour Guide',
    price: 120,
    description: 'Local expert for wilderness hiking.',
    icon: <Compass className="w-5 h-5" />
  },
  {
    id: 6,
    name: 'Photography',
    price: 150,
    description: 'Professional 1-hour session.',
    icon: <Camera className="w-5 h-5" />
  },
  {
    id: 7,
    name: 'Sunset Cruise',
    price: 90,
    description: 'Golden-hour boat ride with refreshments.',
    icon: <Waves className="w-5 h-5" />
  },
  {
    id: 8,
    name: 'Night Fishing',
    price: 95,
    description: 'Evening fishing session with local crew.',
    icon: <Fish className="w-5 h-5" />
  },
  {
    id: 9,
    name: 'Private Chef Dinner',
    price: 130,
    description: 'Personalized Khmer menu at your cabin.',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 10,
    name: 'Campfire Movie Night',
    price: 55,
    description: 'Outdoor cinema set-up with snacks.',
    icon: <Tent className="w-5 h-5" />
  },
  {
    id: 11,
    name: 'Jungle Trek',
    price: 110,
    description: 'Half-day guided hike through forest trails.',
    icon: <Compass className="w-5 h-5" />
  },
  {
    id: 12,
    name: 'Drone Footage',
    price: 140,
    description: 'Aerial highlight clips of your retreat.',
    icon: <Camera className="w-5 h-5" />
  },
  {
    id: 13,
    name: 'Kayak Challenge',
    price: 65,
    description: 'Friendly race setup with safety briefing.',
    icon: <Waves className="w-5 h-5" />
  }
];

export const Activities: React.FC<{
  onBack?: () => void;
  onRequireLogin?: () => void;
  onConfirmBooking?: () => void;
  isAuthenticated?: boolean;
  selectedActivityIds?: number[];
  setSelectedActivityIds?: React.Dispatch<React.SetStateAction<number[]>>;
}> = ({
  onBack,
  onRequireLogin,
  onConfirmBooking,
  isAuthenticated,
  selectedActivityIds,
  setSelectedActivityIds,
}) => {
  const ITEMS_PER_PAGE = 6;
  const [selectedOptions, setSelectedOptions] = useState<number[]>([1, 3]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const basePrice = 250;

  const effectiveSelectedIds = selectedActivityIds ?? selectedOptions;

  const toggleOption = (id: number) => {
    if (setSelectedActivityIds) {
      setSelectedActivityIds((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.includes(id) ? safePrev.filter((o) => o !== id) : [...safePrev, id];
      });
      return;
    }

    setSelectedOptions((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  };

  const selectedExtras = activityOptions.filter(o => effectiveSelectedIds.includes(o.id));
  const totalCost = basePrice + selectedExtras.reduce((sum, o) => sum + o.price, 0);
  const totalPages = Math.max(1, Math.ceil(activityOptions.length / ITEMS_PER_PAGE));
  const paginatedOptions = activityOptions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleConfirm = () => {
    if (isAuthenticated === false) {
      setShowGuestPrompt(true);
      setShowConfirmed(false);
      onRequireLogin?.();
      return;
    }

    setShowGuestPrompt(false);
    setShowConfirmed(true);
    setTimeout(() => setShowConfirmed(false), 2500);

    onConfirmBooking?.();
  };

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
    document.getElementById('activity-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[88rem] mx-auto">
      {/* Hero Section */}
      <div className="relative h-[520px] md:h-[600px] rounded-[3rem] overflow-hidden mb-14 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&q=80&w=2000" 
          alt="Adventure Activities Banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.3),transparent_55%)]" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-14">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured Escape</span>
            <div className="flex items-center gap-1 text-white">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">4.9</span>
              <span className="text-xs text-white/70">(124 reviews)</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-5 tracking-tight leading-[0.95]">Lakeside Wilderness Retreat</h1>
          <p className="text-white/85 max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed">
            Escape the city noise and immerse yourself in the serene beauty of our lakeside cabins. 
            Perfect for outdoor enthusiasts and families looking for an authentic nature experience.
          </p>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-7 left-7 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <section id="activity-options" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customize Your Experience</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Enhance your trip by selecting from our premium extra options below. Your total will update automatically.
            </p>

            <motion.div
              key={`activity-page-${currentPage}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {paginatedOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left group ${
                    effectiveSelectedIds.includes(option.id)
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    effectiveSelectedIds.includes(option.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{option.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold">${option.price}</span>
                        {effectiveSelectedIds.includes(option.id) && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Location</h2>
            <div className="relative h-[300px] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {/* Mock Map Background */}
              <div className="absolute inset-0 opacity-50 dark:opacity-30">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full animate-ping absolute -inset-0" />
                  <div className="relative bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Pinecone Lake, Aspen</p>
                      <p className="text-[10px] text-slate-500">Colorado, USA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6 self-start">
            <div className="rounded-[2.75rem] p-[1px] bg-gradient-to-br from-slate-800/70 via-slate-900 to-slate-950 shadow-2xl">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2.7rem] p-8 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>
              
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300/70">Base Price (1 Day)</span>
                    <span className="font-bold text-white">${basePrice.toFixed(2)}</span>
                  </div>
                
                  {selectedExtras.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Selected Extras</p>
                      {selectedExtras.map(extra => (
                        <div key={extra.id} className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300/70">{extra.name}</span>
                          <span className="font-bold text-white">${extra.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 mb-8">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-base font-bold text-white">Total Cost</p>
                      <p className="text-[10px] text-slate-400">Inclusive of all local taxes and service fees.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-blue-500 tracking-tight">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Check-in</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      Oct 24, 2023
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Guests</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Users className="w-3 h-3 text-blue-500" />
                      2 Adults
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-[0_16px_40px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 mb-3 active:scale-[0.99]"
                >
                  <Calendar className="w-5 h-5" /> Confirm Booking
                </button>
              
                <button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mb-4">
                  Save to Wishlist
                </button>

                {showGuestPrompt && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-amber-200">Login required</p>
                    <p className="text-[11px] text-amber-100/80 mt-1">Please login to confirm booking.</p>
                  </div>
                )}

                {showConfirmed && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-emerald-200">Confirmed</p>
                    <p className="text-[11px] text-emerald-100/80 mt-1">Your activities have been saved.</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-300 font-bold">
                  <Check className="w-3 h-3" /> Free cancellation until 48h before arrival
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800/50 flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-1">Pro Tip</p>
                <p className="text-[10px] text-blue-800/70 dark:text-blue-300/70 leading-relaxed">
                  Booking the "Tour Guide" also unlocks exclusive access to the Hidden Valley trails!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
