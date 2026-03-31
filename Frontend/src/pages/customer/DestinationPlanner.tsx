import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Grid3X3
} from 'lucide-react';

interface DestinationPlannerProps {
  tripData: any;
  setTripData: (data: any) => void;
  onBack: () => void;
  onAddToTrip: () => void;
}

type PropertyType = 'hotel' | 'apartment' | 'resort';

type PropertyListing = {
  id: number;
  name: string;
  city: string;
  country: string;
  locationLabel: string;
  distanceKm: number;
  image: string;
  description: string;
  stars: number;
  reviewScore: number;
  reviewText: string;
  reviewCount: number;
  locationScore: number;
  pricePerNight: number;
  type: PropertyType;
  amenities: string[];
  privateBathroom: boolean;
};

const PROPERTY_LISTINGS: PropertyListing[] = [
  {
    id: 1,
    name: 'Plantation Urban Resort & Spa',
    city: 'Phnom Penh',
    country: 'Cambodia',
    locationLabel: 'Daun Penh, Phnom Penh',
    distanceKm: 0.7,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000',
    description: 'Central oasis with spa, outdoor pool, and quick access to riverside attractions.',
    stars: 4,
    reviewScore: 9.4,
    reviewText: 'Wonderful',
    reviewCount: 3889,
    locationScore: 9.7,
    pricePerNight: 148,
    type: 'resort',
    amenities: ['pool', 'free-wifi', 'spa', 'breakfast'],
    privateBathroom: true
  },
  {
    id: 2,
    name: 'Ohana Phnom Penh Palace Hotel',
    city: 'Phnom Penh',
    country: 'Cambodia',
    locationLabel: 'Daun Penh, Phnom Penh',
    distanceKm: 0.8,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1000',
    description: 'Modern city hotel with rooftop views and easy walking access to markets.',
    stars: 4,
    reviewScore: 8.4,
    reviewText: 'Very Good',
    reviewCount: 2863,
    locationScore: 9.3,
    pricePerNight: 96,
    type: 'hotel',
    amenities: ['pool', 'free-wifi', 'gym'],
    privateBathroom: true
  },
  {
    id: 3,
    name: 'Skyline Riverside Apartments',
    city: 'Phnom Penh',
    country: 'Cambodia',
    locationLabel: 'Chamkar Mon, Phnom Penh',
    distanceKm: 1.9,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
    description: 'Large apartment suites for families, with kitchen and city skyline views.',
    stars: 5,
    reviewScore: 9.1,
    reviewText: 'Superb',
    reviewCount: 1211,
    locationScore: 9.0,
    pricePerNight: 124,
    type: 'apartment',
    amenities: ['free-wifi', 'kitchen', 'family'],
    privateBathroom: true
  },
  {
    id: 4,
    name: 'Royal Palace Boutique Stay',
    city: 'Phnom Penh',
    country: 'Cambodia',
    locationLabel: 'Daun Penh, Phnom Penh',
    distanceKm: 0.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
    description: 'Boutique property near major city landmarks with personalized service.',
    stars: 5,
    reviewScore: 9.0,
    reviewText: 'Wonderful',
    reviewCount: 954,
    locationScore: 9.5,
    pricePerNight: 172,
    type: 'hotel',
    amenities: ['free-wifi', 'breakfast', 'airport-shuttle'],
    privateBathroom: true
  },
  {
    id: 5,
    name: 'Sokha Siem Reap Resort',
    city: 'Siem Reap',
    country: 'Cambodia',
    locationLabel: 'Svay Dangkum, Siem Reap',
    distanceKm: 1.2,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000',
    description: 'Premium resort-style stay with large pool and airport transfer options.',
    stars: 5,
    reviewScore: 8.9,
    reviewText: 'Fabulous',
    reviewCount: 1760,
    locationScore: 8.9,
    pricePerNight: 163,
    type: 'resort',
    amenities: ['pool', 'free-wifi', 'spa', 'family'],
    privateBathroom: true
  },
  {
    id: 6,
    name: 'Kampot River Residence',
    city: 'Kampot',
    country: 'Cambodia',
    locationLabel: 'Kampot Riverside',
    distanceKm: 0.9,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1000',
    description: 'Relaxed riverside lodging with easy day trips to pepper farms.',
    stars: 4,
    reviewScore: 8.7,
    reviewText: 'Excellent',
    reviewCount: 642,
    locationScore: 8.8,
    pricePerNight: 88,
    type: 'hotel',
    amenities: ['free-wifi', 'breakfast'],
    privateBathroom: true
  }
];

const formatSafeDateRange = (startValue: unknown, endValue: unknown, fallback = 'Check-in date — Check-out date'): string => {
  const start = startValue ? new Date(String(startValue)) : null;
  const end = endValue ? new Date(String(endValue)) : null;

  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return fallback;
  }

  return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
};

type SortMode = 'top' | 'price' | 'distance' | 'rating';
type ViewMode = 'list' | 'grid';

const parseGuestInfo = (guestsLabel?: string) => {
  const fallback = { adults: 2, children: 0, rooms: 1 };
  if (!guestsLabel) return fallback;

  const adultsMatch = guestsLabel.match(/(\d+)\s*Adults?/i);
  const childrenMatch = guestsLabel.match(/(\d+)\s*Children?/i);

  return {
    adults: adultsMatch ? Number(adultsMatch[1]) : fallback.adults,
    children: childrenMatch ? Number(childrenMatch[1]) : fallback.children,
    rooms: fallback.rooms
  };
};

export const DestinationPlanner: React.FC<DestinationPlannerProps> = ({
  tripData,
  setTripData,
  onBack,
  onAddToTrip
}) => {
  const initialDestination = tripData?.destination?.name || 'Phnom Penh';
  const guestInfo = parseGuestInfo(tripData?.guests);

  const [destinationInput, setDestinationInput] = useState(initialDestination);
  const [activeDestination, setActiveDestination] = useState(initialDestination);
  const [adults, setAdults] = useState(guestInfo.adults);
  const [children, setChildren] = useState(guestInfo.children);
  const [rooms, setRooms] = useState(guestInfo.rooms);
  const [sortMode, setSortMode] = useState<SortMode>('top');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [privateBathroom, setPrivateBathroom] = useState(false);
  const [wonderfulPlus, setWonderfulPlus] = useState(false);
  const [apartmentsOnly, setApartmentsOnly] = useState(false);
  const [fiveStarsOnly, setFiveStarsOnly] = useState(false);
  const [swimmingPool, setSwimmingPool] = useState(false);
  const [hotelsOnly, setHotelsOnly] = useState(false);
  const [freeWifi, setFreeWifi] = useState(false);

  const checkInText = formatSafeDateRange(tripData?.startDate, tripData?.endDate);

  const cityMatchedListings = useMemo(
    () => PROPERTY_LISTINGS.filter((item) => item.city.toLowerCase().includes(activeDestination.toLowerCase())),
    [activeDestination]
  );

  const filteredListings = useMemo(() => {
    let items = [...cityMatchedListings];

    if (privateBathroom) items = items.filter((item) => item.privateBathroom);
    if (wonderfulPlus) items = items.filter((item) => item.reviewScore >= 9);
    if (apartmentsOnly) items = items.filter((item) => item.type === 'apartment');
    if (fiveStarsOnly) items = items.filter((item) => item.stars === 5);
    if (swimmingPool) items = items.filter((item) => item.amenities.includes('pool'));
    if (hotelsOnly) items = items.filter((item) => item.type === 'hotel' || item.type === 'resort');
    if (freeWifi) items = items.filter((item) => item.amenities.includes('free-wifi'));

    switch (sortMode) {
      case 'price':
        items.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'distance':
        items.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case 'rating':
        items.sort((a, b) => b.reviewScore - a.reviewScore);
        break;
      default:
        items.sort((a, b) => b.reviewScore * Math.log10(b.reviewCount + 10) - a.reviewScore * Math.log10(a.reviewCount + 10));
        break;
    }

    return items;
  }, [
    cityMatchedListings,
    privateBathroom,
    wonderfulPlus,
    apartmentsOnly,
    fiveStarsOnly,
    swimmingPool,
    hotelsOnly,
    freeWifi,
    sortMode
  ]);

  const countByFilter = {
    privateBathroom: cityMatchedListings.filter((i) => i.privateBathroom).length,
    wonderfulPlus: cityMatchedListings.filter((i) => i.reviewScore >= 9).length,
    apartments: cityMatchedListings.filter((i) => i.type === 'apartment').length,
    fiveStars: cityMatchedListings.filter((i) => i.stars === 5).length,
    pool: cityMatchedListings.filter((i) => i.amenities.includes('pool')).length,
    hotels: cityMatchedListings.filter((i) => i.type === 'hotel' || i.type === 'resort').length,
    wifi: cityMatchedListings.filter((i) => i.amenities.includes('free-wifi')).length
  };

  const applyDestinationBooking = (item: PropertyListing) => {
    const guestsLabel = `${adults} Adults${children > 0 ? `, ${children} Children` : ''}`;

    setTripData((prev: any) => ({
      ...prev,
      title: `Adventure in ${item.city}`,
      guests: guestsLabel,
      destination: {
        ...prev.destination,
        name: item.city,
        country: item.country,
        description: item.description,
        image: item.image
      },
      hotel: {
        ...prev.hotel,
        name: item.name,
        location: `${item.city}, ${item.country}`,
        dailyPrice: item.pricePerNight,
        price: item.pricePerNight * (prev?.hotel?.nights || 1),
        image: item.image
      }
    }));

    onAddToTrip();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pt-20 pb-12">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Back to My Plan
        </button>

        <div className="bg-[#0A4AAE] rounded-2xl p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-4 bg-white rounded-xl px-4 py-4 border-4 border-amber-400 flex items-center gap-3">
              <BedDouble className="w-5 h-5 text-slate-500" />
              <input
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="w-full text-lg bg-transparent outline-none text-slate-900"
                placeholder="Where are you going?"
              />
            </div>
            <button className="md:col-span-3 bg-white rounded-xl px-4 py-4 border-4 border-amber-400 text-left flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-bold text-slate-900">{checkInText}</span>
            </button>
            <div className="md:col-span-3 bg-white rounded-xl px-4 py-4 border-4 border-amber-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-bold text-slate-900">{adults} adults · {children} children · {rooms} room</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <button
              onClick={() => setActiveDestination(destinationInput.trim() || initialDestination)}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-2xl py-4 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Home &gt; Cambodia &gt; {activeDestination} &gt; Search results
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="h-44 relative">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                  alt="Map preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/20" />
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Show on map
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Filter by:</h3>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your previous filters</h4>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={privateBathroom} onChange={(e) => setPrivateBathroom(e.target.checked)} /> Private bathroom</span>
                  <span>{countByFilter.privateBathroom}</span>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={wonderfulPlus} onChange={(e) => setWonderfulPlus(e.target.checked)} /> Wonderful: 9+</span>
                  <span>{countByFilter.wonderfulPlus}</span>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={apartmentsOnly} onChange={(e) => setApartmentsOnly(e.target.checked)} /> Apartments</span>
                  <span>{countByFilter.apartments}</span>
                </label>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Popular filters</h4>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={fiveStarsOnly} onChange={(e) => setFiveStarsOnly(e.target.checked)} /> 5 stars</span>
                  <span>{countByFilter.fiveStars}</span>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={swimmingPool} onChange={(e) => setSwimmingPool(e.target.checked)} /> Swimming pool</span>
                  <span>{countByFilter.pool}</span>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={hotelsOnly} onChange={(e) => setHotelsOnly(e.target.checked)} /> Hotels</span>
                  <span>{countByFilter.hotels}</span>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><input type="checkbox" checked={freeWifi} onChange={(e) => setFreeWifi(e.target.checked)} /> Free WiFi</span>
                  <span>{countByFilter.wifi}</span>
                </label>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                {activeDestination}: {filteredListings.length} properties found
              </h2>

              <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  <List className="w-4 h-4" /> List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" /> Grid
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
              >
                <option value="top">Sort by: Our top picks</option>
                <option value="price">Sort by: Price (low to high)</option>
                <option value="distance">Sort by: Distance from downtown</option>
                <option value="rating">Sort by: Guest rating</option>
              </select>
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No properties found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Try another destination or remove some filters.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4">
                    <div className="lg:w-[320px] h-[220px] rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400 underline mb-2">{item.locationLabel}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.distanceKm} km from downtown</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
                    </div>

                    <div className="lg:w-48 flex lg:flex-col items-start lg:items-end justify-between">
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{item.reviewText}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.reviewCount.toLocaleString()} reviews</p>
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-blue-700 text-white font-bold mt-1">
                          {item.reviewScore.toFixed(1)}
                        </div>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">Location {item.locationScore.toFixed(1)}</p>
                      </div>
                      <button
                        onClick={() => applyDestinationBooking(item)}
                        className="mt-3 lg:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold text-sm transition-colors"
                      >
                        Show prices
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="h-44 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.locationLabel}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">${item.pricePerNight} / night</p>
                        <button
                          onClick={() => applyDestinationBooking(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Show prices
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
