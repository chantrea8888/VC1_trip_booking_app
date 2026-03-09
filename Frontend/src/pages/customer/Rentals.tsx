import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  Home, 
  Filter, 
  Star, 
  Users, 
  Fuel, 
  Gauge, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Heart,
  ArrowRight
} from 'lucide-react';

interface RentalsProps {
  onBack: () => void;
  onSelectVehicle?: (vehicle: any) => void;
}

const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const Rentals: React.FC<RentalsProps> = ({ onBack, onSelectVehicle }) => {
  const ITEMS_PER_PAGE = 6;
  const vehicleClasses = ['Economy', 'SUV', 'Luxury', 'Electric', 'Sport'];
  const [activeTab, setActiveTab] = useState<'vehicles' | 'homes'>('vehicles');
  const [priceRange, setPriceRange] = useState(500);
  const [showInstantOnly, setShowInstantOnly] = useState(false);
  const [selectedVehicleClasses, setSelectedVehicleClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');
  const [currentPage, setCurrentPage] = useState(1);

  const vehicles = [
    {
      id: 1,
      name: "Tesla Model Y",
      type: "Electric",
      price: 89,
      rating: 4.9,
      seats: 5,
      transmission: "Auto",
      mileage: "Unlim.",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
      badge: "ELECTRIC",
      instantBook: true
    },
    {
      id: 2,
      name: "Toyota RAV4",
      type: "SUV",
      price: 54,
      rating: 4.7,
      seats: 5,
      bags: 3,
      ac: "A/C",
      image: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&q=80&w=800",
      instantBook: false
    },
    {
      id: 3,
      name: "BMW 4 Series",
      type: "Luxury",
      price: 125,
      rating: 5.0,
      seats: 4,
      performance: "Performance",
      transmission: "Sport Auto",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
      badge: "LUXURY",
      instantBook: true
    },
    {
      id: 4,
      name: "Hyundai Accent",
      type: "Economy",
      price: 38,
      rating: 4.5,
      seats: 5,
      engine: "Hybrid",
      bags: 2,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
      instantBook: true
    },
    {
      id: 5,
      name: "Jeep Wrangler",
      type: "SUV",
      price: 95,
      rating: 4.8,
      drive: "4x4",
      style: "Convertible",
      seats: 4,
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      instantBook: false
    },
    {
      id: 6,
      name: "Polestar 2",
      type: "Electric",
      price: 110,
      rating: 4.9,
      engine: "Electric",
      insurance: "Insurance Incl.",
      seats: 5,
      image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800",
      badge: "NEW",
      instantBook: true
    },
    {
      id: 7,
      name: "Ford Mustang",
      type: "Sport",
      price: 132,
      rating: 4.8,
      seats: 4,
      transmission: "Auto",
      style: "Coupe",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
      badge: "POPULAR",
      instantBook: true
    },
    {
      id: 8,
      name: "Mercedes GLC",
      type: "Luxury SUV",
      price: 148,
      rating: 4.9,
      seats: 5,
      transmission: "Auto",
      bags: 4,
      image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&q=80&w=800",
      instantBook: true
    },
    {
      id: 9,
      name: "Nissan Leaf",
      type: "Electric",
      price: 72,
      rating: 4.6,
      seats: 5,
      transmission: "Auto",
      mileage: "Unlim.",
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=800",
      instantBook: false
    }
  ];

  const stays = [
    {
      id: 1,
      name: "Oceanfront Modern Villa",
      location: "Malibu, California",
      price: 450,
      rating: 4.9,
      guests: 8,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      instantBook: true
    },
    {
      id: 2,
      name: "Highland Forest Cabin",
      location: "Lake Tahoe, Nevada",
      price: 220,
      rating: 4.7,
      guests: 4,
      image: "https://images.unsplash.com/photo-1449156001437-3a1621acda2e?auto=format&fit=crop&q=80&w=800",
      instantBook: false
    },
    {
      id: 3,
      name: "Sunset Mediterranean Villa",
      location: "Santorini, Greece",
      price: 680,
      rating: 4.8,
      guests: 6,
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800",
      instantBook: true
    },
    {
      id: 4,
      name: "Downtown Minimalist Loft",
      location: "Berlin, Germany",
      price: 185,
      rating: 4.6,
      guests: 3,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
      instantBook: false
    }
  ];

  const toggleVehicleClass = (vehicleClass: string) => {
    setSelectedVehicleClasses((prev) =>
      prev.includes(vehicleClass)
        ? prev.filter((selectedClass) => selectedClass !== vehicleClass)
        : [...prev, vehicleClass]
    );
  };

  const queryTokens = normalizeSearchText(searchQuery).trim().split(/\s+/).filter(Boolean);

  const filteredVehicles = vehicles.filter((vehicle: any) => {
    if (vehicle.price > priceRange) return false;
    if (showInstantOnly && !vehicle.instantBook) return false;
    if (selectedVehicleClasses.length > 0) {
      const vehicleType = normalizeSearchText(vehicle.type || '');
      const matchesClass = selectedVehicleClasses.some((vehicleClass) =>
        vehicleType.includes(normalizeSearchText(vehicleClass))
      );
      if (!matchesClass) return false;
    }
    if (queryTokens.length === 0) return true;

    const searchableText = normalizeSearchText(
      [vehicle.name, vehicle.type, vehicle.transmission || '', vehicle.engine || '', vehicle.style || ''].join(' ')
    );
    return queryTokens.every((token) => searchableText.includes(token));
  });

  const filteredStays = stays.filter((stay: any) => {
    if (stay.price > priceRange) return false;
    if (showInstantOnly && !stay.instantBook) return false;
    if (queryTokens.length === 0) return true;

    const searchableText = normalizeSearchText([stay.name, stay.location].join(' '));
    return queryTokens.every((token) => searchableText.includes(token));
  });

  const sortedVehicles = [...filteredVehicles].sort((a: any, b: any) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.rating - a.rating;
  });

  const sortedStays = [...filteredStays].sort((a: any, b: any) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.rating - a.rating;
  });

  const activeItems = activeTab === 'vehicles' ? sortedVehicles : sortedStays;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / ITEMS_PER_PAGE));
  const paginatedItems = activeItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const shouldShowPagination = activeItems.length > ITEMS_PER_PAGE;

  const visiblePages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const pages: Array<number | string> = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  })();

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));
    setCurrentPage(safePage);
    document.getElementById('rental-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, priceRange, selectedVehicleClasses, showInstantOnly, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 pt-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[54vh] min-h-[500px] overflow-hidden mb-14">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Car Rental Banner" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/45 to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.32),transparent_55%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-[0.4em] mb-5">Drive and Stay</p>
            <h1 className="text-5xl md:text-7xl leading-[0.95] font-serif italic text-white mb-5">Find your perfect ride or retreat</h1>
            <p className="text-white/80 text-base md:text-lg max-w-3xl mx-auto">
              Explore the best deals on premium car rentals and curated vacation homes for your next adventure.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${activeTab === 'vehicles' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Car className="w-4 h-4" />
            Vehicle Rentals
            {activeTab === 'vehicles' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('homes')}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${activeTab === 'homes' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-4 h-4" />
            Vacation Homes
            {activeTab === 'homes' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 mb-16">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            <div className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group">
              <Search className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  {activeTab === 'vehicles' ? 'Vehicle Name' : 'Stay Name'}
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'vehicles' ? 'Search cars...' : 'Search stays...'}
                  className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-0 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group border-l border-slate-100 dark:border-slate-800">
              <MapPin className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Paris, France</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer group border-l border-slate-100 dark:border-slate-800">
              <Calendar className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Check in - out</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">12 Oct - 15 Oct 2026</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('rental-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            Search
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h2>
              </div>

              <div className="space-y-8">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Price Range ({activeTab === 'vehicles' ? 'per day' : 'per night'})
                    </label>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>$0</span>
                    <span>${priceRange}+</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Vehicle Class */}
                {activeTab === 'vehicles' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Class</label>
                      {selectedVehicleClasses.length > 0 && (
                        <button
                          onClick={() => setSelectedVehicleClasses([])}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {vehicleClasses.map((cls) => (
                        <label key={cls} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedVehicleClasses.includes(cls)}
                            onChange={() => toggleVehicleClass(cls)}
                            className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cls}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instant Booking */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant Booking</label>
                    <button 
                      onClick={() => setShowInstantOnly(!showInstantOnly)}
                      className={`w-10 h-5 rounded-full transition-all relative ${showInstantOnly ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showInstantOnly ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Only show available</p>
                </div>

                {/* Promo Card */}
                <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">New Feature</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-3 leading-relaxed">
                    Bundle your car & stay to save up to 15% on your booking!
                  </p>
                  <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div id="rental-results" className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900 dark:text-white">{activeItems.length} {activeTab === 'vehicles' ? 'vehicles' : 'homes'}</span>
                {showInstantOnly ? ' | Instant only' : ''}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort by:</span>
                <label className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as 'recommended' | 'price-low' | 'price-high' | 'rating')}
                    className="appearance-none text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 pl-4 pr-8 py-2 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                  <ChevronDown className="pointer-events-none w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </label>
              </div>
            </div>

            {paginatedItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center">
                <p className="text-base font-bold text-slate-900 dark:text-white mb-2">No matching results</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Try changing search text or filters to see more options.</p>
              </div>
            ) : (
              <>
                {activeTab === 'vehicles' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((car: any) => {
                      const carInfo = car.mileage || car.drive || (car.bags ? `${car.bags} Bags` : car.ac || 'Unlim.');
                      return (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            {car.badge && (
                              <div className="absolute top-4 left-4">
                                <span className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                  {car.badge}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-4 right-4">
                              <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {car.rating}
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{car.name}</h3>
                              <div className="text-right">
                                <p className="text-xl font-bold text-blue-600 leading-none">${car.price}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">per day</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">{car.seats} Seats</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Gauge className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">{car.transmission || car.engine || car.performance || 'Auto'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Fuel className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">{carInfo}</span>
                              </div>
                            </div>
                            {car.insurance && (
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{car.insurance}</span>
                              </div>
                            )}
                            {car.style && (
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{car.style}</span>
                              </div>
                            )}
                            <button
                              onClick={() => onSelectVehicle?.(car)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/10"
                            >
                              Book Now
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedItems.map((stay: any) => (
                      <motion.div
                        key={stay.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={stay.image}
                            alt={stay.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4">
                            <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {stay.rating}
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{stay.name}</h3>
                            <p className="text-xl font-bold text-blue-600 shrink-0">${stay.price}</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{stay.location}</p>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-5">
                            <span>{stay.guests} Guests</span>
                            <span>per night</span>
                          </div>
                          <button
                            onClick={() =>
                              onSelectVehicle?.({
                                ...stay,
                                type: 'Vacation Stay',
                                transmission: 'Home'
                              })
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/10"
                          >
                            Reserve Stay
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {shouldShowPagination && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      {visiblePages.map((page, index) => (
                        <button
                          key={`${page}-${index}`}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          disabled={page === '...'}
                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                            page === currentPage
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          } ${page === '...' ? 'pointer-events-none' : ''}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Exclusive Stays */}
        {activeTab === 'vehicles' && (
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Exclusive Stays</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Curated architectural gems for the discerning traveler.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline group">
              Explore all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stays.map((stay) => (
              <motion.div 
                key={stay.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6">
                  <img 
                    src={stay.image} 
                    alt={stay.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-all shadow-xl">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{stay.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{stay.location}</p>
                <p className="text-sm font-bold text-blue-600">${stay.price} <span className="text-slate-400 font-medium">/ night</span></p>
              </motion.div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

