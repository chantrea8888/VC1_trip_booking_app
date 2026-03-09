import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  Heart, 
  Star, 
  Waves, 
  Users, 
  CheckCircle2 
} from 'lucide-react';
import { ALL_HOTELS } from '../../data/hotels';

interface HotelsPageProps {
  tripData?: any;
  onBack: () => void;
  onSelectHotel: (hotel: any) => void;
}

interface RoomOption {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  maxOccupancy: number;
  sizeSqm: number;
}

const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
};

const parseGuestCount = (guestLabel: unknown): number => {
  if (typeof guestLabel === 'number' && Number.isFinite(guestLabel)) {
    return Math.max(1, Math.floor(guestLabel));
  }

  const numericParts: string[] = String(guestLabel || '').match(/\d+/g) ?? [];
  const totalGuests = numericParts.reduce<number>((sum, value) => sum + (parseInt(value, 10) || 0), 0);
  return totalGuests > 0 ? totalGuests : 2;
};

const getTripNights = (tripData?: any): number => {
  const start = tripData?.startDate ? new Date(tripData.startDate) : null;
  const end = tripData?.endDate ? new Date(tripData.endDate) : null;

  if (
    start &&
    end &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime())
  ) {
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  }

  const hotelNights = Number(tripData?.hotel?.nights);
  return Number.isFinite(hotelNights) && hotelNights > 0 ? hotelNights : 1;
};

const buildRoomOptions = (nightlyRate: number): RoomOption[] => [
  {
    id: 'deluxe-king-suite',
    name: 'Deluxe King Suite',
    category: 'Deluxe Suite',
    basePrice: nightlyRate,
    maxOccupancy: 3,
    sizeSqm: 55
  },
  {
    id: 'executive-river-view',
    name: 'Executive River View',
    category: 'Executive Room',
    basePrice: nightlyRate + 65,
    maxOccupancy: 4,
    sizeSqm: 68
  },
  {
    id: 'family-connecting-suite',
    name: 'Family Connecting Suite',
    category: 'Family Suite',
    basePrice: nightlyRate + 110,
    maxOccupancy: 5,
    sizeSqm: 85
  }
];

export const Destinations: React.FC<HotelsPageProps> = ({ tripData, onBack, onSelectHotel }) => {
  const ITEMS_PER_PAGE = 4;
  const [priceRange, setPriceRange] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomByHotel, setSelectedRoomByHotel] = useState<Record<number, string>>({});
  const [guestsByHotel, setGuestsByHotel] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const hotels = ALL_HOTELS;
  const defaultGuests = parseGuestCount(tripData?.guests);
  const tripNights = getTripNights(tripData);

  const queryTokens = normalizeSearchText(searchQuery).trim().split(/\s+/).filter(Boolean);
  const filteredHotels = hotels.filter((hotel) => {
    if (parsePrice(hotel.price) > priceRange) return false;
    if (queryTokens.length === 0) return true;

    const searchableText = normalizeSearchText(
      [hotel.name, hotel.location, hotel.description, hotel.amenities.join(' ')].join(' ')
    );

    return queryTokens.every((token) => searchableText.includes(token));
  });

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / ITEMS_PER_PAGE));
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
    document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceRange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openHotelWithSelection = (hotel: any, rooms: RoomOption[], selectedRoom: RoomOption, guests: number) => {
    onSelectHotel({
      ...hotel,
      price: `$${selectedRoom.basePrice}`,
      rooms: rooms.map((room, index) => ({
        ...room,
        description:
          index === 0
            ? 'King bed with city view and dedicated workspace.'
            : index === 1
            ? 'Panoramic river view with lounge corner and premium bathroom.'
            : 'Two connected rooms, ideal for families and small groups.',
        amenities:
          index === 0
            ? ['Free High-Speed WiFi', 'Mini Bar', 'Private Balcony', '4K Smart TV']
            : index === 1
            ? ['Rainfall Shower', 'Nespresso Machine', 'Bathtub', 'Breakfast Included']
            : ['2 Queen Beds', 'Living Area', 'Kids Welcome Kit', 'Airport Transfer']
      })),
      selectedBooking: {
        roomId: selectedRoom.id,
        roomType: selectedRoom.name,
        roomCategory: selectedRoom.category,
        guests,
        maxOccupancy: selectedRoom.maxOccupancy,
        nightlyPrice: selectedRoom.basePrice
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 pt-20">
      {/* Hero Section */}
      <section className="relative h-[56vh] min-h-[520px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Hotel Banner" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_55%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <p className="text-white/85 text-[11px] font-bold uppercase tracking-[0.45em] mb-5">Curated Collection</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-serif italic text-white mb-8">The Prestige Stays</h1>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Discover signature hotels and resort experiences tailored for comfort, style, and unforgettable city views.
            </p>
            <div className="flex items-center gap-4 bg-white/12 backdrop-blur-xl p-3 rounded-3xl border border-white/25 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-4 min-h-[52px]">
                <Search className="w-4 h-4 text-white/60" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  placeholder="Where to next?" 
                  className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 text-sm w-full"
                />
              </div>
              <button 
                onClick={() => {
                  document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-slate-900 px-8 py-3 rounded-2xl text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                Explore
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-12">
          <button onClick={onBack} className="hover:text-blue-600 transition-colors">Home</button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Hotels & Resorts</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 space-y-12">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Filters</h2>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="space-y-10">
                {/* Price Range */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nightly Rate</label>
                    <span className="text-sm font-serif italic text-slate-900 dark:text-white">Up to ${priceRange}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                  />
                </div>

                {/* Star Rating */}
                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Star Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3].map(star => (
                      <button key={star} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${star === 5 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'}`}>
                        {star} Stars
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amenities</label>
                  <div className="space-y-3">
                    {["Michelin Dining", "Private Spa", "Rooftop Pool", "Butler Service"].map(amenity => (
                      <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-20" />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="relative rounded-3xl overflow-hidden aspect-square group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                alt="Map Preview" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-900" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">View on Map</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Section */}
          <div id="hotel-results" className="flex-1 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Showing {filteredHotels.length} {filteredHotels.length === 1 ? 'Property' : 'Properties'}
                {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
                <button className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Recommended <Filter className="w-3 h-3" />
                </button>
              </div>
            </div>

            <motion.div
              key={`hotel-page-${currentPage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {filteredHotels.length > 0 ? (
                paginatedHotels.map((hotel) => {
                  const roomOptions = buildRoomOptions(parsePrice(hotel.price));
                  const defaultRoom = roomOptions[0];
                  const selectedRoomId = selectedRoomByHotel[hotel.id] || defaultRoom.id;
                  const selectedRoom =
                    roomOptions.find((room) => room.id === selectedRoomId) || defaultRoom;
                  const selectedGuests = Math.min(
                    Math.max(guestsByHotel[hotel.id] || defaultGuests, 1),
                    selectedRoom.maxOccupancy
                  );
                  const quickTotal = selectedRoom.basePrice * tripNights;

                  return (
                  <motion.div 
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row"
                  >
                    {/* Image Container */}
                    <div 
                      className="w-full md:w-[45%] h-[400px] md:h-auto relative overflow-hidden cursor-pointer"
                      onClick={() => openHotelWithSelection(hotel, roomOptions, selectedRoom, selectedGuests)}
                    >
                      <img 
                        src={hotel.image} 
                        alt={hotel.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-8 left-8">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-4 py-2 rounded-xl shadow-xl uppercase tracking-widest">
                          Prestige Stay
                        </span>
                      </div>
                      <button className="absolute top-8 right-8 p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-all shadow-xl">
                        <Heart className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-8 left-8 flex gap-2">
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                          Breakfast Included
                        </span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Exceptional Stay</p>
                              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{hotel.reviews}</p>
                            </div>
                          </div>
                        </div>

                        <h3 
                          className="text-3xl font-serif italic text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => openHotelWithSelection(hotel, roomOptions, selectedRoom, selectedGuests)}
                        >
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400 mb-6">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{hotel.location}</span>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 line-clamp-2">
                          {hotel.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-10">
                          {hotel.amenities.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-slate-300" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{amenity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mb-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Booking</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              {tripNights} {tripNights === 1 ? 'Night' : 'Nights'} Estimate
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Room Type</p>
                              <select
                                value={selectedRoom.id}
                                onChange={(e) => {
                                  const nextRoom =
                                    roomOptions.find((room) => room.id === e.target.value) || defaultRoom;
                                  setSelectedRoomByHotel((prev) => ({ ...prev, [hotel.id]: nextRoom.id }));
                                  setGuestsByHotel((prev) => ({
                                    ...prev,
                                    [hotel.id]: Math.min(prev[hotel.id] || defaultGuests, nextRoom.maxOccupancy)
                                  }));
                                }}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                              >
                                {roomOptions.map((room) => (
                                  <option key={room.id} value={room.id}>
                                    {room.name} • ${room.basePrice}/night
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Guests</p>
                              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2">
                                <button
                                  onClick={() =>
                                    setGuestsByHotel((prev) => ({
                                      ...prev,
                                      [hotel.id]: Math.max(1, selectedGuests - 1)
                                    }))
                                  }
                                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500"
                                >
                                  -
                                </button>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedGuests}</span>
                                <button
                                  onClick={() =>
                                    setGuestsByHotel((prev) => ({
                                      ...prev,
                                      [hotel.id]: Math.min(selectedRoom.maxOccupancy, selectedGuests + 1)
                                    }))
                                  }
                                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {selectedRoom.maxOccupancy} max guests • {selectedRoom.sizeSqm} sqm
                            </p>
                            <p className="text-sm font-bold text-blue-600">${quickTotal.toLocaleString()} total</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between pt-10 border-t border-slate-50 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">From</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-serif italic text-slate-900 dark:text-white">${selectedRoom.basePrice}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">/ Night</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-widest">
                            {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'} • {selectedRoom.category}
                          </p>
                        </div>
                        <button 
                          onClick={() => openHotelWithSelection(hotel, roomOptions, selectedRoom, selectedGuests)}
                          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 dark:hover:bg-blue-50 hover:text-white transition-all shadow-xl active:scale-95"
                        >
                          Reserve Stay
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Hotels Found</h3>
                  <p className="text-slate-500 dark:text-slate-400">Try searching by hotel name, city, or amenity.</p>
                </div>
              )}
            </motion.div>

            {filteredHotels.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl text-xs font-bold transition-all ${
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
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

