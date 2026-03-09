import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, subMonths, addDays, differenceInDays } from 'date-fns';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Waves, 
  Spade as Spa, 
  Dumbbell, 
  Utensils, 
  Car, 
  CheckCircle2, 
  ChevronLeft,
  Share2,
  Heart,
  Info,
  Users,
  LayoutGrid
} from 'lucide-react';

interface RoomOption {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  maxOccupancy: number;
  sizeSqm: number;
  description: string;
  amenities: string[];
}

export interface HotelReservationSelection {
  roomType: string;
  roomCategory: string;
  guests: number;
  maxOccupancy: number;
  nightlyPrice: number;
  nights: number;
  roomSubtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
}

interface HotelDetailsProps {
  tripData?: any;
  hotel?: any;
  onBack: () => void;
  onReserve?: (selection: HotelReservationSelection) => void;
}

const parseGuestCount = (guestLabel: unknown): number => {
  if (typeof guestLabel === 'number' && Number.isFinite(guestLabel)) {
    return Math.max(1, Math.floor(guestLabel));
  }

  const numericParts: string[] = String(guestLabel || '').match(/\d+/g) ?? [];
  const totalGuests = numericParts.reduce<number>((sum, value) => sum + (parseInt(value, 10) || 0), 0);
  return totalGuests > 0 ? totalGuests : 2;
};

const resolveDateValue = (value: unknown): Date | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const HotelDetails: React.FC<HotelDetailsProps> = ({ tripData, hotel: initialHotel, onBack, onReserve }) => {
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const defaultGuestCount = parseGuestCount(tripData?.guests);
  const [guests, setGuests] = useState(defaultGuestCount);
  
  // Default data if none provided (matching the screenshot)
  const today = new Date('2026-03-03T00:34:03-08:00');
  
  const defaultHotel = {
    name: "Royal Riverside Sanctuary",
    location: "Riverside District, Komrong",
    rating: 5.0,
    category: "Star Resort",
    reviewsCount: 420,
    price: 185,
    description: "Nestled along the serene banks of the Komrong River, the Royal Riverside Sanctuary offers a transcendental escape from the bustle of modern life. This architectural masterpiece blends traditional Khmer motifs with contemporary luxury. Experience the ultimate \"Sanctuary Vibe\" as you wake up to the gentle mist on the water and spend your days unwinding in our world-class infinity pool or award-winning riverside spa.",
    images: [
      "https://images.unsplash.com/photo-1544013587-41428e7177e9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1569660072562-47a003360691?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800"
    ],
    amenities: [
      { icon: <Wifi className="w-5 h-5" />, label: "Free High-speed WiFi" },
      { icon: <Waves className="w-5 h-5" />, label: "Infinity Pool" },
      { icon: <Spa className="w-5 h-5" />, label: "Luxury Spa" },
      { icon: <Dumbbell className="w-5 h-5" />, label: "Fitness Center" },
      { icon: <Utensils className="w-5 h-5" />, label: "Riverside Dining" },
      { icon: <Car className="w-5 h-5" />, label: "Free Parking" }
    ],
    reviews: [
      {
        id: 1,
        author: "Marcus Thompson",
        date: format(subMonths(today, 1), 'MMMM yyyy'),
        avatar: "https://i.pravatar.cc/150?u=marcus",
        comment: "The most relaxing stay I've ever had. The riverside breakfast is a must-try!"
      },
      {
        id: 2,
        author: "Sarah Jenkins",
        date: format(subMonths(today, 2), 'MMMM yyyy'),
        avatar: "https://i.pravatar.cc/150?u=sarah",
        comment: "Perfect for our group trip. The staff was incredibly helpful with our itinerary."
      }
    ]
  };

  // Merge initialHotel with defaults and handle structure differences
  const hotel = initialHotel ? {
    ...defaultHotel,
    ...initialHotel,
    // Handle images vs image
    images: initialHotel.images || (initialHotel.image ? [initialHotel.image, ...defaultHotel.images.slice(1)] : defaultHotel.images),
    // Handle amenities as strings or objects
    amenities: Array.isArray(initialHotel.amenities) 
      ? initialHotel.amenities.map((a: any) => typeof a === 'string' ? { icon: <CheckCircle2 className="w-5 h-5" />, label: a } : a)
      : defaultHotel.amenities,
    // Handle rating as number or score string
    rating: initialHotel.rating || parseFloat(initialHotel.score) || defaultHotel.rating,
    // Handle reviews count
    reviewsCount: initialHotel.reviewsCount || (typeof initialHotel.reviews === 'string' ? parseInt(initialHotel.reviews) : defaultHotel.reviewsCount),
    // Ensure reviews is an array
    reviews: Array.isArray(initialHotel.reviews) ? initialHotel.reviews : defaultHotel.reviews
  } : defaultHotel;

  // Helper to parse price
  const parsePrice = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      return parseFloat(p.replace(/[^0-9.]/g, ''));
    }
    return 0;
  };

  const hotelPrice = parsePrice(hotel.price);

  const roomOptions = useMemo<RoomOption[]>(() => {
    const basePrice = hotelPrice || 120;
    const fallbackRooms: RoomOption[] = [
      {
        id: 'deluxe-king-suite',
        name: 'Deluxe King Suite',
        category: 'Deluxe Suite',
        basePrice,
        maxOccupancy: 3,
        sizeSqm: 55,
        description: 'King bed with city view and dedicated workspace.',
        amenities: ['Free High-Speed WiFi', 'Mini Bar', 'Private Balcony', '4K Smart TV']
      },
      {
        id: 'executive-river-view',
        name: 'Executive River View',
        category: 'Executive Room',
        basePrice: basePrice + 65,
        maxOccupancy: 4,
        sizeSqm: 68,
        description: 'Panoramic river view with lounge corner and premium bathroom.',
        amenities: ['Rainfall Shower', 'Nespresso Machine', 'Bathtub', 'Breakfast Included']
      },
      {
        id: 'family-connecting-suite',
        name: 'Family Connecting Suite',
        category: 'Family Suite',
        basePrice: basePrice + 110,
        maxOccupancy: 5,
        sizeSqm: 85,
        description: 'Two connected rooms, ideal for families and small groups.',
        amenities: ['2 Queen Beds', 'Living Area', 'Kids Welcome Kit', 'Airport Transfer']
      }
    ];

    if (!Array.isArray(initialHotel?.rooms) || initialHotel.rooms.length === 0) {
      return fallbackRooms;
    }

    const normalizedRooms = initialHotel.rooms
      .map((room: any, index: number): RoomOption => {
        const normalizedName = room?.name || room?.roomName || `Room ${index + 1}`;
        return {
          id: String(room?.id || room?.roomId || normalizedName.toLowerCase().replace(/\s+/g, '-')),
          name: normalizedName,
          category: room?.category || room?.roomCategory || 'Room',
          basePrice: parsePrice(room?.basePrice ?? room?.price ?? room?.nightlyPrice ?? basePrice),
          maxOccupancy: Number(room?.maxOccupancy ?? room?.occupancy ?? room?.capacity ?? 2),
          sizeSqm: Number(room?.sizeSqm ?? room?.size ?? room?.roomSize ?? 35),
          description: room?.description || 'Comfortable room designed for a restful stay.',
          amenities: Array.isArray(room?.amenities) ? room.amenities : []
        };
      })
      .filter((room: RoomOption) => room.basePrice > 0);

    return normalizedRooms.length > 0 ? normalizedRooms : fallbackRooms;
  }, [hotelPrice, initialHotel]);

  useEffect(() => {
    if (selectedRoomId || roomOptions.length === 0) return;
    setSelectedRoomId(roomOptions[0].id);
  }, [selectedRoomId, roomOptions]);

  const selectedRoom = useMemo(
    () => roomOptions.find((room) => room.id === selectedRoomId) || roomOptions[0],
    [roomOptions, selectedRoomId]
  );

  useEffect(() => {
    if (!selectedRoom) return;
    setGuests((currentGuests) => Math.min(Math.max(currentGuests, 1), selectedRoom.maxOccupancy));
  }, [selectedRoom]);

  useEffect(() => {
    const booking = initialHotel?.selectedBooking;
    if (!booking || roomOptions.length === 0) return;

    const matchedRoom =
      roomOptions.find((room) => room.id === booking.roomId || room.name === booking.roomType) ||
      roomOptions[0];

    setSelectedRoomId(matchedRoom.id);

    const bookingGuests = parseGuestCount(booking.guests || defaultGuestCount);
    setGuests(Math.min(Math.max(bookingGuests, 1), matchedRoom.maxOccupancy));
  }, [defaultGuestCount, initialHotel?.id, initialHotel?.selectedBooking, roomOptions]);

  const plannedCheckInDate = resolveDateValue(tripData?.startDate) || addDays(new Date(), 7);
  const requestedCheckOutDate = resolveDateValue(tripData?.endDate);
  const plannedCheckOutDate =
    requestedCheckOutDate && requestedCheckOutDate.getTime() > plannedCheckInDate.getTime()
      ? requestedCheckOutDate
      : addDays(plannedCheckInDate, 1);
  const nights = Math.max(differenceInDays(plannedCheckOutDate, plannedCheckInDate), 1);
  const nightlyPrice = selectedRoom?.basePrice || hotelPrice;
  const cleaningFee = Math.max(25, Math.round(nightlyPrice * 0.12));
  const serviceFee = Math.max(20, Math.round(nightlyPrice * nights * 0.08));
  const roomSubtotal = nightlyPrice * nights;
  const total = roomSubtotal + cleaningFee + serviceFee;
  const perPerson = total / guests;

  const handleReserveClick = () => {
    if (!selectedRoom) return;

    onReserve?.({
      roomType: selectedRoom.name,
      roomCategory: selectedRoom.category,
      guests,
      maxOccupancy: selectedRoom.maxOccupancy,
      nightlyPrice,
      nights,
      roomSubtotal,
      cleaningFee,
      serviceFee,
      totalPrice: total
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to search
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[500px] mb-12 rounded-[2rem] overflow-hidden">
          <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer">
            <img 
              src={hotel.images?.[0]} 
              alt={hotel.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative group cursor-pointer">
            <img 
              src={hotel.images?.[1]} 
              alt={hotel.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative group cursor-pointer">
            <img 
              src={hotel.images?.[2]} 
              alt={hotel.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="md:col-span-2 relative group cursor-pointer">
            <img 
              src={hotel.images?.[3]} 
              alt={hotel.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <button className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 hover:bg-white transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{hotel.rating} {hotel.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900 dark:text-white mb-4">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{hotel.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{hotel.reviewsCount} Reviews</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif italic text-slate-900 dark:text-white">Description</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Amenities */}
            <div className="space-y-8">
              <h2 className="text-xl font-serif italic text-slate-900 dark:text-white">What this place offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {hotel.amenities.map((amenity: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                    <div className="text-blue-600">
                      {amenity.icon}
                    </div>
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Reviews */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif italic text-slate-900 dark:text-white">Reviews</h2>
                <button className="text-xs font-bold text-blue-600 hover:underline">See All Reviews</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.reviews.map((review: any) => (
                  <div key={review.id} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={review.avatar} 
                        alt={review.author} 
                        className="w-12 h-12 rounded-2xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{review.author}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Location */}
            <div className="space-y-8">
              <h2 className="text-xl font-serif italic text-slate-900 dark:text-white">Location</h2>
              <div className="relative h-[400px] rounded-[2rem] overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                  alt="Map" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{hotel.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Price Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif italic text-slate-900 dark:text-white">${nightlyPrice}</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ night</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-widest">
                    Best Price Guarantee
                  </div>
                </div>

                {/* Date/Guest Picker */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-4 border-r border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{format(plannedCheckInDate, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{format(plannedCheckOutDate, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guests</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests((value) => Math.max(1, value - 1))}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40"
                        disabled={guests <= 1}
                      >
                        -
                      </button>
                      <button
                        onClick={() => setGuests((value) => Math.min(selectedRoom?.maxOccupancy || value, value + 1))}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40"
                        disabled={guests >= (selectedRoom?.maxOccupancy || guests)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Room Type Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Choose Room Type</h4>
                    {selectedRoom && (
                      <span className="text-[10px] font-bold text-blue-600">
                        Sleeps up to {selectedRoom.maxOccupancy}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {roomOptions.map((room) => {
                      const isSelected = room.id === selectedRoom?.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/20 shadow-sm'
                              : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{room.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-600">${room.basePrice}</p>
                              <p className="text-[10px] text-slate-400">per night</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{room.maxOccupancy} guests</span>
                            <span>{room.sizeSqm} sqm</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedRoom && (
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedRoom.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRoom.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedRoom.amenities.slice(0, 3).join(' • ')}
                    </p>
                  </div>
                )}

                {/* Group Booking Mode */}
                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Group Booking Mode</h4>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Split costs with friends</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsGroupMode(!isGroupMode)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isGroupMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGroupMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isGroupMode && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2 border-t border-blue-100 dark:border-blue-900/30"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-blue-600">Cost per person: ${perPerson.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest">Split equally between {guests} people</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reserve Button */}
                <button 
                  onClick={handleReserveClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Reserve Now
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">You won't be charged yet</p>

                {/* Price Breakdown */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">${nightlyPrice} x {nights} nights</span>
                    <span className="font-bold text-slate-900 dark:text-white">${roomSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Cleaning fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Service fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">${serviceFee}</span>
                  </div>
                  <hr className="border-slate-100 dark:border-slate-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-serif italic text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-serif italic text-slate-900 dark:text-white">${total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
