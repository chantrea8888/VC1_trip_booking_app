import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Hotel, 
  Car, 
  Activity,
  ChevronRight,
  ArrowRight,
  Search,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Users
} from 'lucide-react';
import { 
  format, 
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
  isAfter,
  differenceInDays
} from 'date-fns';
import { AVAILABLE_ACTIVITIES } from '../../data/activities';

interface TripPlannerProps {
  tripData: any;
  setTripData: (data: any) => void;
  selectedActivityIds: number[];
  setSelectedActivityIds: (ids: number[]) => void;
  onBack: () => void;
  onHotelClick: () => void;
  onExploreHotel: () => void;
  onRentalClick: () => void;
  onActivitiesClick: () => void;
  onProceedToBooking: () => void;
}

const DESTINATION_OPTIONS = [
  {
    name: 'Siem Reap',
    country: 'Cambodia',
    description: 'Gateway to Angkor Wat and Khmer heritage.',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Phnom Penh',
    country: 'Cambodia',
    description: 'Capital city with riverside culture and history.',
    image: 'https://images.unsplash.com/photo-1563200193-066366530438?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Koh Rong',
    country: 'Cambodia',
    description: 'Island escape with beaches and clear turquoise water.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Kampot',
    country: 'Cambodia',
    description: 'A relaxed riverside town with nature and food experiences.',
    image: 'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=800'
  }
];

const parseDateValue = (value: unknown): Date | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateRangeFromTripData = (tripData: any): { start: Date | null; end: Date | null } => {
  const startFromState = parseDateValue(tripData?.startDate);
  const endFromState = parseDateValue(tripData?.endDate);
  if (startFromState && endFromState) {
    return { start: startFromState, end: endFromState };
  }

  const rawDateRange = String(tripData?.dates || '');
  const dateParts = rawDateRange.split(' - ');
  if (dateParts.length === 2) {
    const endFromString = parseDateValue(dateParts[1]);
    let startFromString = parseDateValue(dateParts[0]);

    if (!startFromString && endFromString) {
      startFromString = parseDateValue(`${dateParts[0]}, ${endFromString.getFullYear()}`);
    }

    if (startFromString && endFromString) {
      return { start: startFromString, end: endFromString };
    }
  }

  return { start: null, end: null };
};

export const TripPlanner: React.FC<TripPlannerProps> = ({
  tripData,
  setTripData,
  selectedActivityIds,
  setSelectedActivityIds,
  onBack,
  onHotelClick,
  onExploreHotel,
  onRentalClick,
  onActivitiesClick,
  onProceedToBooking
}) => {
  const initialDateRange = getDateRangeFromTripData(tripData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(initialDateRange.start || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const today = new Date();

  const [dates, setDates] = useState<{ start: Date | null, end: Date | null }>(initialDateRange);

  const fallbackDestination =
    tripData.destination?.name ||
    tripData.hotel.location.split(',')[0] ||
    DESTINATION_OPTIONS[0].name;
  const [location, setLocation] = useState(fallbackDestination);
  const activeDestinationOption =
    DESTINATION_OPTIONS.find((dest) => dest.name.toLowerCase() === location.toLowerCase()) ||
    tripData.destination ||
    DESTINATION_OPTIONS[0];

  const selectedActivities = AVAILABLE_ACTIVITIES.filter(a => selectedActivityIds.includes(a.id));
  const suggestedActivities = AVAILABLE_ACTIVITIES.filter(a => !selectedActivityIds.includes(a.id)).slice(0, 3);

  useEffect(() => {
    const destinationName = tripData.destination?.name || tripData.hotel.location.split(',')[0] || DESTINATION_OPTIONS[0].name;
    setLocation(destinationName);
  }, [tripData.destination?.name, tripData.hotel.location]);

  useEffect(() => {
    const nextDateRange = getDateRangeFromTripData(tripData);
    setDates(nextDateRange);
    if (nextDateRange.start) {
      setCurrentMonth(nextDateRange.start);
    }
  }, [tripData.startDate, tripData.endDate, tripData.dates]);

  const applyDestination = (nextLocation: string) => {
    const normalizedLocation = nextLocation.trim();
    if (!normalizedLocation) return;

    const matchedDestination = DESTINATION_OPTIONS.find(
      (destination) => destination.name.toLowerCase() === normalizedLocation.toLowerCase()
    );

    setLocation(normalizedLocation);
    setTripData((prev: any) => ({
      ...prev,
      title: `Adventure in ${normalizedLocation}`,
      destination: {
        ...prev.destination,
        name: normalizedLocation,
        country: matchedDestination?.country || prev.destination?.country || 'Cambodia',
        description:
          matchedDestination?.description ||
          prev.destination?.description ||
          `Discover ${normalizedLocation} at your own pace.`,
        image: matchedDestination?.image || prev.destination?.image || DESTINATION_OPTIONS[0].image
      }
    }));
  };

  const removeActivity = (id: number) => {
    setSelectedActivityIds(selectedActivityIds.filter(aid => aid !== id));
  };

  const addActivity = (id: number) => {
    if (!selectedActivityIds.includes(id)) {
      setSelectedActivityIds([...selectedActivityIds, id]);
    }
  };

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

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  const confirmDates = () => {
    if (dates.start && dates.end) {
      const dateRangeString = `${format(dates.start, 'MMMM d')} - ${format(dates.end, 'MMMM d, yyyy')}`;
      
      const diffTime = Math.abs(dates.end.getTime() - dates.start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        setTripData({ 
          ...tripData, 
          dates: dateRangeString,
          startDate: dates.start,
          endDate: dates.end,
          hotel: {
            ...tripData.hotel,
            nights: days,
            price: (tripData.hotel.dailyPrice || 350) * days
          },
          rental: {
            ...tripData.rental,
            days: days,
            price: (tripData.rental.dailyPrice || 80) * days
          }
        });
      } else {
        setTripData({ 
          ...tripData, 
          dates: dateRangeString,
          startDate: dates.start,
          endDate: dates.end,
          hotel: {
            ...tripData.hotel,
            nights: 1,
            price: (tripData.hotel.dailyPrice || 350)
          },
          rental: {
            ...tripData.rental,
            days: 1,
            price: (tripData.rental.dailyPrice || 80)
          }
        });
      }
      
      setShowDatePicker(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="relative mb-12 rounded-[32px] overflow-visible p-16 md:p-24 min-h-[400px] flex items-end group">
          <div className="absolute inset-0 rounded-[32px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=2000" 
              alt="Siem Reap Banner" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest mb-6">
                <span className="cursor-pointer hover:text-white transition-colors" onClick={onBack}>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-400">My Plan</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                {tripData.title} {tripData.emoji}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                {/* Date Picker Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowLocationPicker(false);
                    }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white hover:bg-white/20 transition-all group"
                  >
                    <Calendar className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{tripData.dates}</span>
                  </button>

                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-4 w-[95vw] md:w-[720px] bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 z-[100]"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 text-left">Select Dates</span>
                            <h3 className="text-lg font-bold text-white text-left">Adjust your trip</h3>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"><ChevronRightIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-12">
                          {renderMonth(currentMonth)}
                          <div className="hidden lg:block w-px bg-white/10" />
                          {renderMonth(addMonths(currentMonth, 1))}
                        </div>
                        <div className="mt-10 pt-8 border-t border-white/10 flex justify-end gap-4">
                          <button onClick={() => setShowDatePicker(false)} className="text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
                          <button onClick={confirmDates} disabled={!dates.start || !dates.end} className="bg-white text-slate-900 px-10 py-4 rounded-2xl text-xs font-bold hover:bg-blue-50 transition-all shadow-xl disabled:opacity-50">Confirm Dates</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location Picker Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowLocationPicker(!showLocationPicker);
                      setShowDatePicker(false);
                    }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white hover:bg-white/20 transition-all group"
                  >
                    <MapPin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{location}</span>
                  </button>

                  <AnimatePresence>
                    {showLocationPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-4 w-80 bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-6 z-[100]"
                      >
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                applyDestination(location);
                                setShowLocationPicker(false);
                              }
                            }}
                            placeholder="Change destination..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          {DESTINATION_OPTIONS.map((destinationOption) => (
                            <button 
                              key={destinationOption.name}
                              onClick={() => {
                                applyDestination(destinationOption.name);
                                setShowLocationPicker(false);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all text-sm flex items-center gap-3"
                            >
                              <MapPin className="w-4 h-4 opacity-40" />
                              {destinationOption.name}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            applyDestination(location);
                            setShowLocationPicker(false);
                          }}
                          className="w-full mt-4 bg-white text-slate-900 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-all"
                        >
                          Apply Destination
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-50 transition-all text-lg shrink-0">
              <Save className="w-6 h-6" /> Save Itinerary
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Itinerary */}
          <div className="lg:col-span-8 space-y-8">

            {/* Destination */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <MapPin className="w-5 h-5" />
                  <h3>Destination</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setShowLocationPicker(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                  >
                    Quick Edit
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-6 items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={activeDestinationOption.image} alt={activeDestinationOption.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{activeDestinationOption.name}</h4>
                  <p className="text-sm text-slate-400">{activeDestinationOption.country}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{activeDestinationOption.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trip Base</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{activeDestinationOption.name}</p>
                </div>
              </div>
            </section>
            
            {/* Accommodation */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <Hotel className="w-5 h-5" />
                  <h3>Hotel</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onExploreHotel}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Explore
                  </button>
                  <button 
                    onClick={onHotelClick}
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-6 items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={tripData.hotel.image} alt={tripData.hotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{tripData.hotel.name}</h4>
                  <p className="text-sm text-slate-400">{tripData.hotel.roomType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">${(tripData.hotel.dailyPrice || 0).toFixed(2)}<span className="text-[10px] text-slate-400 font-normal ml-1">/night</span></p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: ${tripData.hotel.price.toFixed(2)}</p>
                </div>
              </div>
            </section>

            {/* Transport */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Car className="w-5 h-5" />
                  <h3>Rental</h3>
                </div>
                <button 
                  onClick={onRentalClick}
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  {tripData.rental.isBooked ? 'Change' : 'Add'}
                </button>
              </div>
              {tripData.rental.isBooked ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={tripData.rental.image} alt={tripData.rental.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{tripData.rental.name}</h4>
                    <p className="text-sm text-slate-400">{tripData.rental.features}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">${(tripData.rental.dailyPrice || 0).toFixed(2)}<span className="text-[10px] text-slate-400 font-normal ml-1">/day</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: ${tripData.rental.price.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full py-12 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <Car className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No rental selected</p>
                </div>
              )}
            </section>

            {/* Activities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Activity className="w-5 h-5" />
                  <h3>Selected Activities</h3>
                </div>
                <button 
                  onClick={onActivitiesClick}
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  Browse All
                </button>
              </div>
              <div className="space-y-4">
                {selectedActivities.length > 0 ? (
                  selectedActivities.map((activity) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={activity.id} 
                      className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{activity.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{activity.date}</p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <Users className="w-3 h-3" /> {activity.guests} Guests
                          </div>
                        </div>
                      </div>
                      <div className="text-right pr-4">
                        <p className="font-bold text-slate-900 dark:text-white mb-0.5">${(activity.price * activity.guests).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 mb-2">${activity.price.toFixed(2)} / person</p>
                        <button 
                          onClick={() => removeActivity(activity.id)}
                          className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full py-12 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                    <Activity className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No activities selected</p>
                  </div>
                )}
              </div>

              {suggestedActivities.length > 0 && (
                <div className="mt-12">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Suggested for you</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {suggestedActivities.map((activity) => (
                      <div key={activity.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm group">
                        <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 right-2">
                            <button 
                              onClick={() => addActivity(activity.id)}
                              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-blue-600 shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{activity.name}</h5>
                        <p className="text-blue-600 font-bold text-xs">${activity.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 dark:bg-white rounded-[2.5rem] p-8 text-white dark:text-slate-900 shadow-2xl sticky top-32">
              <h3 className="text-xl font-bold mb-8">Trip Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white/60 dark:text-slate-500 text-sm">Destination</span>
                    <span className="text-[10px] text-white/40 dark:text-slate-400">{activeDestinationOption.country}</span>
                  </div>
                  <span className="font-bold">{activeDestinationOption.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white/60 dark:text-slate-500 text-sm">Hotel</span>
                    <span className="text-[10px] text-white/40 dark:text-slate-400">${(tripData.hotel.dailyPrice || 0).toFixed(2)} /night</span>
                  </div>
                  <span className="font-bold">${tripData.hotel.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white/60 dark:text-slate-500 text-sm">Rental</span>
                    <span className="text-[10px] text-white/40 dark:text-slate-400">${(tripData.rental.dailyPrice || 0).toFixed(2)} /day</span>
                  </div>
                  <span className="font-bold">${tripData.rental.isBooked ? tripData.rental.price.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white/60 dark:text-slate-500 text-sm">Activities</span>
                    <span className="text-[10px] text-white/40 dark:text-slate-400">{selectedActivities.length} items</span>
                  </div>
                  <span className="font-bold">${selectedActivities.reduce((sum, a) => sum + (a.price * a.guests), 0).toFixed(2)}</span>
                </div>
                <div className="pt-6 border-t border-white/10 dark:border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold">Total Est.</span>
                  <span className="text-3xl font-bold text-blue-400 dark:text-blue-600">
                    ${(
                      tripData.hotel.price + 
                      (tripData.rental.isBooked ? tripData.rental.price : 0) + 
                      selectedActivities.reduce((sum, a) => sum + (a.price * a.guests), 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={onProceedToBooking}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mb-4"
              >
                Proceed to Booking <ArrowRight className="w-5 h-5" />
              </button>
              
              <p className="text-[10px] text-white/40 dark:text-slate-400 text-center leading-relaxed">
                Prices are estimates and subject to change until booking is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
