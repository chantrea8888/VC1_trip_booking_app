import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Hotel, 
  Ship, 
  Waves, 
  Star, 
  CheckCircle2, 
  Heart, 
  X, 
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  isBefore,
  isAfter
} from 'date-fns';
import { ALL_HOTELS } from '../../data/hotels';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '@/services/bookingService';

// --- Sub-components (could be further split) ---
const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const parseDateValue = (value: unknown): Date | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseGuestsFromLabel = (guestLabel: unknown): { adults: number; children: number } => {
  const rawValue = String(guestLabel || '');

  const adultsMatch = rawValue.match(/(\d+)\s*adult/i);
  const childrenMatch = rawValue.match(/(\d+)\s*child/i);
  if (adultsMatch || childrenMatch) {
    return {
      adults: Math.max(1, parseInt(adultsMatch?.[1] || '2', 10)),
      children: Math.max(0, parseInt(childrenMatch?.[1] || '0', 10))
    };
  }

  const numericParts = rawValue.match(/\d+/g) || [];
  if (numericParts.length > 0) {
    return {
      adults: Math.max(0, parseInt(numericParts[0], 10) || 0),
      children: Math.max(0, parseInt(numericParts[1] || '0', 10) || 0)
    };
  }

  return { adults: 0, children: 0 };
};

const getDatesFromTripData = (tripData?: any): { start: Date | null; end: Date | null } => {
  const start = parseDateValue(tripData?.startDate);
  const end = parseDateValue(tripData?.endDate);
  if (start && end) {
    return { start, end };
  }

  return { start: null, end: null };
};

const DESTINATION_SUGGESTIONS = Array.from(
  new Set([
    ...ALL_HOTELS.map((hotel) => hotel.location),
    'Siem Reap',
    'Seim Reap',
    'Phnom Penh',
    'Sihanoukville',
    'Koh Rong',
    'Kampot',
  ]),
);

const Hero = ({ 
  onSearch, 
  location, 
  setLocation,
  tripData
}: { 
  onSearch: (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => void;
  location: string;
  setLocation: (val: string) => void;
  tripData?: any;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const initialDates = getDatesFromTripData(tripData);
  const [guests, setGuests] = useState(() => parseGuestsFromLabel(tripData?.guests));
  
  const today = new Date();
  const [dates, setDates] = useState<{ start: Date | null, end: Date | null }>(initialDates);
  const [currentMonth, setCurrentMonth] = useState(initialDates.start || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const stayWindowLabel =
    dates.start && dates.end
      ? `${format(dates.start, 'MMM d')} - ${format(dates.end, 'MMM d')}`
      : 'your selected dates';
  const locationSuggestions = React.useMemo(() => {
    const query = normalizeSearchText(location.trim());
    if (!query) {
      return DESTINATION_SUGGESTIONS.slice(0, 6);
    }

    return DESTINATION_SUGGESTIONS
      .filter((option) => normalizeSearchText(option).includes(query))
      .sort((a, b) => {
        const aStarts = normalizeSearchText(a).startsWith(query) ? 0 : 1;
        const bStarts = normalizeSearchText(b).startsWith(query) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.localeCompare(b);
      })
      .slice(0, 6);
  }, [location]);

  useEffect(() => {
    const nextDates = getDatesFromTripData(tripData);
    setDates(nextDates);
    if (nextDates.start) {
      setCurrentMonth(nextDates.start);
    }
    setGuests(parseGuestsFromLabel(tripData?.guests));
  }, [tripData?.startDate, tripData?.endDate, tripData?.dates, tripData?.guests]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onSearch(location, dates, guests);
    }, 800);
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const handleDateClick = (day: Date) => {
      if (isBefore(day, today) && !isSameDay(day, today)) return;

      if (!dates.start || (dates.start && dates.end)) {
        setDates({ start: day, end: null });
      } else if (dates.start && !dates.end) {
        if (isBefore(day, dates.start)) {
          setDates({ start: day, end: dates.start });
        } else {
          setDates({ ...dates, end: day });
        }
      }
    };

    const isInRange = (day: Date) => {
      if (!dates.start) return false;
      
      const end = dates.end || hoveredDate;
      if (!end) return false;

      if (isBefore(end, dates.start)) {
        return isAfter(day, end) && isBefore(day, dates.start);
      }
      return isAfter(day, dates.start) && isBefore(day, end);
    };

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center justify-center mb-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">{format(month, 'MMMM yyyy')}</h4>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-[10px] font-bold text-white/30 text-center uppercase py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const isStart = dates.start && isSameDay(day, dates.start);
            const isEnd = dates.end && isSameDay(day, dates.end);
            const isSelected = isStart || isEnd;
            const range = isInRange(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isPast = isBefore(day, today) && !isSameDay(day, today);

            return (
              <button
                key={i}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => !dates.end && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isPast}
                className={`
                  relative h-10 w-full flex items-center justify-center text-[11px] font-medium transition-all
                  ${!isCurrentMonth ? 'text-white/5' : 'text-white'}
                  ${isPast ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10'}
                  ${isSelected ? 'bg-blue-600 text-white font-bold rounded-lg z-10' : ''}
                  ${range ? 'bg-blue-600/20 text-blue-400' : ''}
                  ${isToday(day) && !isSelected ? 'after:content-[""] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full' : ''}
                  ${isStart && (dates.end || hoveredDate) && !isSameDay(dates.start, dates.end || hoveredDate!) ? 'rounded-r-none rounded-l-lg' : ''}
                  ${isEnd && dates.start && !isSameDay(dates.start, dates.end) ? 'rounded-l-none rounded-r-lg' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 text-left">Select Dates</span>
            <h3 className="text-lg font-bold text-white text-left">Choose your stay</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentMonth.toISOString()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col lg:flex-row gap-12 w-full"
            >
              {renderMonth(currentMonth)}
              <div className="hidden lg:block w-px bg-white/10" />
              {renderMonth(addMonths(currentMonth, 1))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative min-h-[600px] md:h-[700px] flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 rounded-[3rem] overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Hotel" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />
        </motion.div>
        
        <div className="relative z-10 max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              Exclusive Travel Experiences
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white mb-8 leading-[0.9] tracking-tight">
              Explore the <br />
              <span className="italic font-serif font-light">Kingdom</span> of Wonder
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto w-full"
          >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-2 w-full">
              <div className="flex-1 flex items-center gap-4 px-8 py-4 w-full border-b md:border-b-0 md:border-r border-white/10">
                <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                <div className="relative w-full">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Where to next?"
                    className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 w-full text-base p-0 font-medium"
                  />
                  <AnimatePresence>
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute left-0 top-[calc(100%+0.8rem)] z-[120] w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-950"
                      >
                        {locationSuggestions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setLocation(option);
                              setShowLocationSuggestions(false);
                            }}
                            className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-slate-900"
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocation('');
                    setShowLocationSuggestions(true);
                  }}
                  className="text-white/35 hover:text-white transition-colors text-lg leading-none"
                  aria-label="Clear destination"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDatePicker((previous) => !previous);
                }}
                className="flex-1 md:flex-[0.95] flex items-center gap-4 px-8 py-4 w-full border-b md:border-b-0 md:border-r border-white/10 text-left"
              >
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">View on Map</p>
                  <p className="truncate text-sm font-semibold text-white">{location.trim() || 'Seim Reap'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDatePicker((previous) => !previous);
                }}
                className="flex-1 md:flex-[0.95] flex items-center gap-4 px-8 py-4 w-full border-b md:border-b-0 md:border-r border-white/10 text-left"
              >
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Check-in / Check-out</p>
                  <p className="truncate text-sm font-semibold text-white">
                    {dates.start && dates.end
                      ? `${format(dates.start, 'MMM d')} - ${format(dates.end, 'MMM d')}`
                      : 'Set dates'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-[2rem] font-bold text-sm transition-all w-full md:w-auto flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                  />
                ) : 'Explore'}
              </button>
            </div>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 mx-auto w-[95vw] md:w-[720px] bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 z-[100] text-left"
                >
                  {renderCalendar()}

                  <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 text-left">Duration</span>
                        <span className="text-sm font-bold text-white">
                          {dates.start && dates.end
                            ? `${Math.ceil((dates.end.getTime() - dates.start.getTime()) / (1000 * 60 * 60 * 24))} Nights`
                            : 'Select range'}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 text-left">Price Range</span>
                        <span className="text-sm font-bold text-blue-400">Premium Selection</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => setDates({ start: null, end: null })}
                        className="text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => {
                          onSearch(location, dates, guests);
                          setShowDatePicker(false);
                        }}
                        className="flex-1 sm:flex-none bg-white text-slate-900 px-10 py-4 rounded-2xl text-xs font-bold hover:bg-blue-50 transition-all shadow-xl"
                      >
                        Confirm Dates
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


const Categories = ({ 
  onHotelsClick, 
  onRentalsClick, 
  onActivitiesClick 
}: { 
  onHotelsClick: () => void; 
  onRentalsClick: () => void; 
  onActivitiesClick: () => void; 
}) => {
  const categories = [
    { icon: Hotel, title: "Hotel", desc: "Villas & Resorts", color: "bg-blue-500/10 text-blue-500", onClick: onHotelsClick },
    { icon: Ship, title: "Rental", desc: "Ferries & Boats", color: "bg-emerald-500/10 text-emerald-500", onClick: onRentalsClick },
    { icon: Waves, title: "Activities", desc: "Tours & Diving", color: "bg-amber-500/10 text-amber-500", onClick: onActivitiesClick },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={cat.onClick}
            className="bg-white dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col gap-4 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
          >
            <div className={`${cat.color} w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Now <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const EcoTourPromotion = ({ onClick }: { onClick: () => void }) => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div 
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center cursor-pointer group hover:shadow-xl transition-all duration-500"
      >
        <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=800" 
            alt="Eco Tour" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-8 flex-1 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Get 15% off your first Eco-tour this month!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Limited time offer for authentic Cambodian experiences, exclusively for Sokha.</p>
          </div>
          <button className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-8 py-3 rounded-xl font-bold text-sm hover:bg-cyan-200 transition-all whitespace-nowrap">
            Claim Discount
          </button>
        </div>
      </div>
    </section>
  );
};

const RecommendedForYou = ({ onSelect }: { onSelect: (item: any) => void }) => {
  const recommendations = [
    {
      id: 1,
      name: "Elephant Valley Project",
      title: "Elephant Valley Project",
      location: "Mondulkiri, Cambodia",
      rating: 4.9,
      price: "$85",
      unit: "night",
      image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=800",
      badge: "ECO-CERTIFIED",
      type: "hotel"
    },
    {
      id: 2,
      name: "The Peninsula Paris",
      title: "The Peninsula Paris",
      location: "16th Arr., Paris",
      rating: 5.0,
      price: "$1,580",
      unit: "night",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
      badge: "TOP RATED",
      type: "hotel"
    },
    {
      id: 3,
      name: "Raffles Grand Hotel d'Angkor",
      title: "Raffles Grand Hotel d'Angkor",
      location: "Siem Reap, Cambodia",
      rating: 5.0,
      price: "$350",
      unit: "night",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
      badge: "ULTRA-LUXURY",
      type: "hotel"
    },
    {
      id: 4,
      name: "Le Bristol Paris",
      title: "Le Bristol Paris",
      location: "8th Arr., Paris",
      rating: 5.0,
      price: "$1,420",
      unit: "night",
      image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800",
      badge: "CLASSIC LUXURY",
      type: "hotel"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-3 block">Curated Selection</span>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Recommended for You</h2>
        </div>
        <button className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
          View All Collections <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {recommendations.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -12 }}
            onClick={() => onSelect(item)}
            className="group bg-white dark:bg-slate-800/40 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-red-500 hover:border-red-500 transition-all"
              >
                <Heart className="w-4 h-4" />
              </button>
              {item.badge && (
                <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-8">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                ))}
                <span className="text-[10px] font-bold text-slate-400 ml-1">{item.rating}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {item.location}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {item.price} <span className="text-xs font-medium text-slate-400">/ {item.unit}</span>
                </p>
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 scale-0 group-hover:scale-100 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TrendingDestinations = ({ onSelect }: { onSelect: (dest: any) => void }) => {
  const destinations = [
    { 
      id: 1, 
      name: "Siem Reap", 
      count: "1,200+ experiences", 
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800",
      description: "The gateway to the ancient world of Angkor.",
      source: "trending",
      popularSpots: ["Angkor Wat", "Pub Street", "Tonle Sap Lake"]
    },
    { 
      id: 2, 
      name: "Koh Rong", 
      count: "450+ experiences", 
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
      description: "Cambodia's second largest island.",
      source: "trending",
      popularSpots: ["Long Beach", "Koh Touch", "Coconut Beach"]
    },
    { 
      id: 3, 
      name: "Phnom Penh", 
      count: "800+ experiences", 
      image: "https://images.unsplash.com/photo-1563200193-066366530438?auto=format&fit=crop&q=80&w=800",
      description: "The bustling capital of Cambodia.",
      source: "trending",
      popularSpots: ["Royal Palace", "Central Market", "Riverside"]
    },
    { 
      id: 4, 
      name: "Kep", 
      count: "230+ experiences", 
      image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
      description: "A charming seaside town.",
      source: "trending",
      popularSpots: ["Crab Market", "Kep National Park", "Rabbit Island"]
    },
    { 
      id: 5, 
      name: "Kampot", 
      count: "310+ experiences", 
      image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=800",
      description: "Riverside town with a laid-back atmosphere.",
      source: "trending",
      popularSpots: ["Bokor Mountain", "River Cruises", "Pepper Plantations"]
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-3 block">Global Trends</span>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Trending Destinations</h2>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <button className="p-3 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide -mx-4 px-4">
        {destinations.map((dest) => (
          <motion.div 
            key={dest.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(dest)}
            className="relative min-w-[320px] h-[450px] rounded-[3rem] overflow-hidden cursor-pointer flex-shrink-0 group"
          >
            <img 
              src={dest.image} 
              alt={dest.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{dest.count}</p>
              <h3 className="text-white font-bold text-3xl mb-4">{dest.name}</h3>
              <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                {dest.popularSpots.map((spot, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const AngkorWatGallery = () => {
  const photos = [
    {
      url: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=1200",
      title: "Main Temple Reflection",
      desc: "The iconic five towers reflected in the northern pond at sunrise."
    },
    {
      url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      title: "Bayon Temple Faces",
      desc: "The serene stone faces of Avalokiteshvara watching over the ancient city."
    },
    {
      url: "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&q=80&w=1200",
      title: "Ta Prohm Jungle Temple",
      desc: "Where nature and architecture merge, famous for the giant silk-cotton trees."
    },
    {
      url: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?auto=format&fit=crop&q=80&w=1200",
      title: "Aerial View of Angkor",
      desc: "A breathtaking perspective of the world's largest religious monument."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">The Majesty of Angkor Wat</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Explore the architectural masterpiece of the Khmer Empire. A UNESCO World Heritage site that stands as a testament to human ingenuity and devotion.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative group h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
          >
            <img 
              src={photo.url} 
              alt={photo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <h3 className="text-white font-bold text-lg mb-1">{photo.title}</h3>
              <p className="text-white/80 text-xs">{photo.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const SplitBillFeature = ({ onStartGroupBooking }: { onStartGroupBooking?: () => void }) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        <div className="flex-1 w-full order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              Seamless Collaboration
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
              Travel Together, <br />
              <span className="italic font-serif font-light">Pay Simpler</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed max-w-xl">
              Our unique "Split-the-Bill" feature allows you to book for your entire group and easily divide costs between friends. No more manual calculations or chasing down payments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { title: "Smart Breakdown", desc: "Automatic per-person price calculation" },
                { title: "Direct Links", desc: "Individual payment links for every traveler" },
                { title: "Real-time Tracking", desc: "See instantly who has completed payment" },
                { title: "Zero Stress", desc: "No more manual chasing or awkward talks" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onStartGroupBooking}
              className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[2rem] font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
              disabled={!onStartGroupBooking}
              title={!onStartGroupBooking ? 'Group booking is not available here' : undefined}
            >
              Start Group Booking
            </button>
          </motion.div>
        </div>
        <div className="flex-1 relative w-full order-1 lg:order-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-square relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200" 
                alt="Group of friends" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-10 -right-10 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 z-20 min-w-[280px]"
            >
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Payment Status</h4>
              <div className="space-y-6">
                {[
                  { name: "Alex Johnson", amount: "$120.00", status: "Paid", color: "text-emerald-500" },
                  { name: "Sarah Miller", amount: "$120.00", status: "Pending", color: "text-amber-500" },
                  { name: "David Chen", amount: "$120.00", status: "Paid", color: "text-emerald-500" }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.amount}</p>
                      <p className={`text-[9px] font-bold ${p.color}`}>{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-bold text-white/40 dark:text-slate-400 uppercase tracking-[0.4em] mb-6 block">Stay Inspired</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white dark:text-slate-900 mb-8 tracking-tight">
              Get the <span className="italic font-serif font-light">latest</span> travel <br /> stories & offers
            </h2>
            
            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 bg-white/10 dark:bg-slate-100 p-2 rounded-[2rem] border border-white/10 dark:border-slate-200"
                >
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-white dark:text-slate-900 placeholder:text-white/40 dark:placeholder:text-slate-400 text-sm"
                  />
                  <button 
                    type="submit"
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-10 py-4 rounded-[1.5rem] font-bold text-sm hover:scale-105 transition-transform shadow-xl"
                  >
                    Subscribe Now
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] text-emerald-500"
                >
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
                  <p className="text-sm opacity-80">Thank you for subscribing. Expect magic in your inbox soon.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface DashboardProps {
  tripData?: any;
  onSelectRecommendation: (item: any) => void;
  onSelectDestination: (dest: any) => void;
  onPromotionsClick: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onActivitiesClick: () => void;
  onSearch?: (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => void;
  onSearchDestination?: (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => void;
  onStartGroupBooking?: () => void;
  onOpenBookTrip?: () => void;
  onOpenMyBookings?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  tripData,
  onSelectRecommendation, 
  onSelectDestination,
  onPromotionsClick,
  onHotelsClick,
  onRentalsClick,
  onActivitiesClick,
  onSearch,
  onSearchDestination,
  onStartGroupBooking,
  onOpenBookTrip,
  onOpenMyBookings,
}) => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<any[]>([]);
const [hasSearched, setHasSearched] = useState(false);
const { user, isAuthenticated } = useAuth();
const [myBookings, setMyBookings] = useState<any[]>([]);
const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateBooking = () => {
    if (onOpenBookTrip) {
      onOpenBookTrip();
      return;
    }
    navigate('/customer/book');
  };

  const handleViewAllBookings = () => {
    if (onOpenMyBookings) {
      onOpenMyBookings();
      return;
    }
    navigate('/customer/bookings');
  };

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated || user?.role !== 'customer' || !user?.id) {
        setMyBookings([]);
        return;
      }

      try {
        setMyBookingsLoading(true);
        const response = await bookingService.getCustomerBookings(user.id);
        const data = Array.isArray(response.data) ? response.data : [];
        setMyBookings(data.slice(0, 3));
      } catch {
        setMyBookings([]);
      } finally {
        setMyBookingsLoading(false);
      }
    };

    run();
  }, [isAuthenticated, user?.id, user?.role]);

  const handleSearchInternal = (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    setHasSearched(true);
    
    // Call external onSearch if provided to update global state
    if (onSearch) {
      onSearch(query, dates, guests);
    }

    if (trimmedQuery && onSearchDestination) {
      onSearchDestination(trimmedQuery, dates, guests);
    }

    if (!trimmedQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const queryTokens = normalizeSearchText(trimmedQuery).split(/\s+/).filter(Boolean);
    const results = ALL_HOTELS.filter((hotel) => {
      const searchableText = normalizeSearchText(
        [
          hotel.name,
          hotel.location,
          hotel.description,
          Array.isArray(hotel.amenities) ? hotel.amenities.join(' ') : ''
        ].join(' ')
      );

      return queryTokens.every((token) => searchableText.includes(token));
    });
    setSearchResults(results);
  };

  return (
    <main>
      <Hero 
        onSearch={handleSearchInternal} 
        location={location}
        setLocation={setLocation}
        tripData={tripData}
      />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold tracking-widest uppercase text-slate-500 dark:text-slate-300">
                Recent bookings
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Your latest reservations appear here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated && user?.role === 'customer' ? (
                <button
                  type="button"
                  onClick={handleCreateBooking}
                  className="h-11 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                >
                  Create booking
                </button>
              ) : (
                <Link
                  to="/login"
                  className="h-11 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                >
                  Login to book
                </Link>
              )}
              <button
                type="button"
                onClick={handleViewAllBookings}
                className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
              >
                View all
              </button>
            </div>
          </div>

          <div className="mt-6">
            {!isAuthenticated || user?.role !== 'customer' ? (
              <div className="py-10 text-center text-slate-600 dark:text-slate-300 font-semibold">
                Login as a customer to see your bookings.
              </div>
            ) : myBookingsLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="py-10 text-center text-slate-600 dark:text-slate-300 font-semibold">
                No bookings yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
                {myBookings.map((b) => (
                  <div key={b.id} className="px-5 py-4 bg-white/70 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate">{b.service}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.route}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{b.id}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">
                          {String(b.status ?? '').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <AnimatePresence>
        {hasSearched && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Search Results for "{searchQuery}"
              </h2>
              <button 
                onClick={() => {
                  setHasSearched(false);
                  setSearchQuery('');
                  setLocation('');
                }}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2"
              >
                Clear Search <X className="w-4 h-4" />
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((hotel) => (
                  <motion.div 
                    key={hotel.id}
                    whileHover={{ y: -5 }}
                    onClick={() => onSelectRecommendation(hotel)}
                    className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400">
                        <Heart className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{hotel.location}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{hotel.price} / night</p>
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Results Found</h3>
                <p className="text-slate-500 dark:text-slate-400">We couldn't find any destinations matching your search.</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {!hasSearched && (
        <>
          <Categories 
            onHotelsClick={onHotelsClick}
            onRentalsClick={onRentalsClick}
            onActivitiesClick={onActivitiesClick}
          />
          <EcoTourPromotion onClick={onPromotionsClick} />
          <RecommendedForYou onSelect={onSelectRecommendation} />
          <AngkorWatGallery />
          <TrendingDestinations onSelect={onSelectDestination} />
          <SplitBillFeature onStartGroupBooking={onStartGroupBooking} />
          <Newsletter />
        </>
      )}
    </main>
  );
};
