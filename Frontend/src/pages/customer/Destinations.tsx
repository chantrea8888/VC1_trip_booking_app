
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Dumbbell,
  Filter,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Waves,
  Wifi,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

import { getHotels, type Hotel } from '@/data/hotels';
import { apiRequest } from '@/services/api';
import { getPublicDestinations } from '@/services/destinationService';
import { getPublicPromotions } from '@/services/promotionService';

export default function Destinations({ onOpenMessages }: { onOpenMessages?: () => void }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [destinations, setDestinations] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [groupMode, setGroupMode] = React.useState(true);
  const [selectedStars, setSelectedStars] = React.useState<number | null>(null);
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<'newest' | 'recommended' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [priceRange, setPriceRange] = React.useState(500);
  const DEST_CACHE_KEY = 'customer_destinations_cache';

  const loadDestinations = React.useCallback(async () => {
    setLoadError('');
    setIsLoading(true);

    try {
      const data = await getPublicDestinations();
      setDestinations(Array.isArray(data) ? data : []);
      try {
        localStorage.setItem(DEST_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch {
        /* ignore storage errors */
      }
    } catch (error) {
      const apiMessage = typeof (error as any)?.data?.message === 'string' ? (error as any).data.message.trim() : '';
      const runtimeMessage = typeof (error as any)?.message === 'string' ? (error as any).message.trim() : '';
      setLoadError(apiMessage || runtimeMessage || 'Failed to load destinations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // hydrate from cache first for instant display
    try {
      const cached = localStorage.getItem(DEST_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data)) {
          setDestinations(parsed.data);
          setIsLoading(false);
        }
      }
    } catch {
      /* ignore cache parse errors */
    }

    void loadDestinations();
  }, [loadDestinations]);

  // keep in sync without manual refresh: focus + light polling
  React.useEffect(() => {
    const refresh = () => void loadDestinations();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('visibilitychange', onVisibility);
    const id = window.setInterval(refresh, 15000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(id);
    };
  }, [loadDestinations]);

  const priceCeiling = React.useMemo(() => {
    const highestPrice = destinations.reduce((max, destination) => Math.max(max, Number(destination.price) || 0), 0);
    return Math.max(500, Math.ceil(highestPrice / 50) * 50);
  }, [destinations]);

  React.useEffect(() => {
    setPriceRange((previous) => Math.min(Math.max(previous, 100), priceCeiling));
  }, [priceCeiling]);

  const areaOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          destinations
            .map((destination) => String(destination.location || '').split(',')[0]?.trim())
            .filter(Boolean),
        ),
      ).slice(0, 4),
    [destinations],
  );

  const amenityOptions = React.useMemo(() => {
    const uniqueAmenities = Array.from(
      new Set(
        destinations.flatMap((destination: any) =>
          Array.isArray(destination.amenities) ? destination.amenities.filter(Boolean) : [],
        ),
      ),
    );

    return uniqueAmenities.slice(0, 4);
  }, [destinations]);

  const filteredDestinations = React.useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return destinations.filter((destination: any) => {
      if (search) {
        const matchesSearch =
          destination.name.toLowerCase().includes(search) ||
          destination.location.toLowerCase().includes(search) ||
          destination.type.toLowerCase().includes(search);

        if (!matchesSearch) return false;
      }

      if ((Number(destination.price) || 0) > priceRange) return false;
      if (selectedStars !== null && (Number(destination.rating) || 0) < selectedStars) return false;

      if (selectedAreas.length > 0) {
        const matchesArea = selectedAreas.some((area) => destination.location.toLowerCase().includes(area.toLowerCase()));
        if (!matchesArea) return false;
      }

      if (selectedAmenities.length > 0) {
        const destinationAmenities = Array.isArray(destination.amenities) ? destination.amenities : [];
        const normalizedAmenities = destinationAmenities.map((amenity: string) => amenity.toLowerCase());
        const matchesAmenities = selectedAmenities.every((amenity) => normalizedAmenities.includes(amenity.toLowerCase()));
        if (!matchesAmenities) return false;
      }

      return true;
    });
  }, [destinations, priceRange, searchTerm, selectedAmenities, selectedAreas, selectedStars]);

  const sortedDestinations = React.useMemo(() => {
    const items = [...filteredDestinations];

    items.sort((left, right) => {
      if (sortBy === 'newest') return parseCreatedAt(right.created_at) - parseCreatedAt(left.created_at);
      if (sortBy === 'price-low') return left.price - right.price;
      if (sortBy === 'price-high') return right.price - left.price;
      if (sortBy === 'rating') return right.rating - left.rating;
      return right.rating * 100 - left.rating * 100 + (left.price - right.price) * 0.05;
    });

    return items;
  }, [filteredDestinations, sortBy]);

  const regionLabel = React.useMemo(() => {
    const firstLocation = selectedAreas[0] || sortedDestinations[0]?.location || destinations[0]?.location || 'Cambodia';
    return firstLocation.split(',')[0]?.trim() || 'Cambodia';
  }, [destinations, selectedAreas, sortedDestinations]);

  const openChatWithOwner = (owner: any) => {
    if (!owner?.id) {
      return;
    }

    const threadData = {
      ownerId: owner.id,
      ownerName: owner.name || owner.email || 'Owner',
      ownerEmail: owner.email || '',
      ownerAvatar: owner.avatar || '',
    };
    sessionStorage.setItem('pending_message_thread', JSON.stringify(threadData));

    if (onOpenMessages) {
      onOpenMessages();
    } else {
      console.warn('onOpenMessages callback not provided; please use the Messages view manually.');
    }
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((previous) => (previous.includes(area) ? previous.filter((item) => item !== area) : [...previous, area]));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((previous) => (previous.includes(amenity) ? previous.filter((item) => item !== amenity) : [...previous, amenity]));
  };

  const visibleDestinations = sortedDestinations;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-[#f7f8fc] p-4 sm:p-6">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <nav className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <span>Home</span>
                <span>&gt;</span>
                <span>Cambodia</span>
                <span>&gt;</span>
                <span>{regionLabel}</span>
              </nav>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">All Hotels</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sortedDestinations.length} properties found for your dates</p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:self-auto">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'newest' | 'recommended' | 'price-low' | 'price-high' | 'rating')}
                className="border-none bg-transparent pr-5 text-sm font-semibold text-slate-900 outline-none focus:ring-0 dark:text-slate-100"
              >
                <option value="newest">Newest First</option>
                <option value="recommended">Recommended</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
              </select>
            </div>
          </div>

          {loadError && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300 md:flex-row md:items-center md:justify-between">
              <span>{loadError}</span>
              <button
                onClick={() => void loadDestinations()}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div id="destination-results" className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading destinations...
            </div>
          ) : visibleDestinations.length > 0 ? (
            <div id="destination-results" className="space-y-4">
              {visibleDestinations.map((destination, index) => {
                const itemIndex = index;
                const badge = itemIndex % 3 === 0 ? 'Special Deal' : itemIndex % 3 === 2 ? 'Limited Offer' : 'Featured Stay';
                const interestCount = 1 + (itemIndex % 2);
                const formerPrice = Math.round(destination.price * 1.3);
                const note =
                  itemIndex % 3 === 2
                    ? 'Last 2 rooms available'
                    : itemIndex % 3 === 1
                      ? 'Excellent choice for business travelers'
                      : '';
                const buttonClass =
                  itemIndex % 3 === 1
                    ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                    : 'bg-blue-600 hover:bg-blue-700';
                const highlightAmenities = (
                  Array.isArray((destination as any).amenities) ? (destination as any).amenities : []
                ).slice(0, 3);

                return (
                  <motion.article
                    key={destination.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative lg:w-[43%]">
                        {(() => {
                          const galleryImages = Array.isArray(destination.images)
                            ? destination.images
                                .map((image: string) => String(image || '').trim())
                                .filter(Boolean)
                                .slice(0, 4)
                            : [];
                          const displayImages = [
                            destination.image,
                            ...galleryImages,
                          ]
                            .map((image) => String(image || '').trim())
                            .filter(Boolean)
                            .filter((image, index, items) => items.indexOf(image) === index)
                            .slice(0, 4);

                          if (displayImages.length > 1) {
                            return (
                              <div className="grid h-60 grid-cols-2 grid-rows-2 gap-1 overflow-hidden lg:h-full">
                                {displayImages.map((image, index) => (
                                  <img
                                    key={`${destination.id}-${index}-${image}`}
                                    src={image}
                                    alt={`${destination.name} photo ${index + 1}`}
                                    className={`h-full w-full object-cover ${index === 0 ? 'row-span-2' : ''}`}
                                    referrerPolicy="no-referrer"
                                  />
                                ))}
                              </div>
                            );
                          }

                          return (
                            <img
                              src={displayImages[0] || destination.image}
                              alt={destination.name}
                              className="h-60 w-full object-cover lg:h-full"
                              referrerPolicy="no-referrer"
                            />
                          );
                        })()}
                        <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${itemIndex % 3 === 2 ? 'bg-blue-600' : 'bg-red-500'}`}>{badge}</div>
                        <button className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-slate-400 shadow-md transition-colors hover:text-red-500">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="mb-2 flex items-center gap-1.5 text-amber-400">
                                {Array.from({ length: 5 }, (_, starIndex) => (
                                  <Star key={starIndex} className={`h-3.5 w-3.5 ${starIndex < Math.round(destination.rating) ? 'fill-current' : ''}`} />
                                ))}
                                <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{destination.rating.toFixed(1)} ({420 + itemIndex * 38} reviews)</span>
                              </div>
                              <h2 className="text-[1.9rem] font-bold tracking-tight text-slate-900 dark:text-slate-100">{destination.name}</h2>
                              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <MapPin className="h-4 w-4" />
                                {destination.location}
                              </p>
                              {destination.owner ? (
                                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  Owner: {destination.owner.name || destination.owner.email || 'Unknown'}
                                </p>
                              ) : null}
                            </div>

                            <div className="text-left md:text-right">
                              <p className="text-sm text-slate-300 line-through">${formerPrice}</p>
                              <p className="text-3xl font-extrabold text-red-500">${Math.round(destination.price)}</p>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Per night / excl. tax</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {highlightAmenities.map((amenity: string, amenityIndex: number) => (
                              <span key={`${destination.id}-${amenity}`} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {amenityIndex === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : amenityIndex === 1 ? <Waves className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{destination.description}</p>
                          {note ? (
                            <div className={`mt-4 text-xs font-medium ${itemIndex % 3 === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {itemIndex % 3 === 2 ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" /> : null}
                              <span className="align-middle">{note}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {[0, 1, 2].map((avatar) => (
                                <div key={avatar} className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-400 dark:border-slate-900" />
                              ))}
                            </div>
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{interestCount} friends interested</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openChatWithOwner(destination.owner)}
                              className="rounded-xl px-6 py-3 text-sm font-semibold bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                            >
                              Chat with Owner
                            </button>
                            <button className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors ${buttonClass}`}>
                              View Selection
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div id="destination-results" className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No destinations found</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another filter combination or come back after owners publish more destinations.</p>
            </div>
          )}

        </div>
      </div>

      {loadError && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300 md:flex-row md:items-center md:justify-between">
          <span>{loadError}</span>
          <button
            onClick={() => void loadDestinations()}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading destinations...
        </div>
      ) : filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <article
              key={destination.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative">
                {(() => {
                  const galleryImages = Array.isArray(destination.images)
                    ? destination.images
                        .map((image) => String(image || '').trim())
                        .filter(Boolean)
                        .slice(0, 4)
                    : [];
                  const displayImages = [
                    destination.image,
                    ...galleryImages,
                  ]
                    .map((image) => String(image || '').trim())
                    .filter(Boolean)
                    .filter((image, index, items) => items.indexOf(image) === index)
                    .slice(0, 4);

                  if (displayImages.length > 1) {
                    return (
                      <div className="grid h-56 grid-cols-2 grid-rows-2 gap-1 overflow-hidden">
                        {displayImages.map((image, index) => (
                          <img
                            key={`${destination.id}-${index}-${image}`}
                            src={image}
                            alt={`${destination.name} photo ${index + 1}`}
                            className={`h-full w-full object-cover ${index === 0 ? 'row-span-2' : ''}`}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <img
                      src={displayImages[0] || destination.image}
                      alt={destination.name}
                      className="h-56 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  );
                })()}
                <div
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    destination.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  {(destination.status ?? 'draft').toUpperCase()}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
                  {destination.type}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{destination.name}</h2>
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={15} className="shrink-0" />
                    <span>{destination.location}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {(destination as any).has_promotion && (destination as any).promotion && (
                      <div className="flex flex-col gap-1">
                        <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                          {(destination as any).discount_percentage}% OFF
                        </span>
                        {(destination as any).promotion.expiry && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Expires: {new Date((destination as any).promotion.expiry).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {(destination as any).has_promotion ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${(destination as any).discounted_price.toFixed(0)}
                          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">/ night</span>
                        </p>
                        <p className="text-sm line-through text-slate-400 dark:text-slate-500">
                          ${destination.price.toFixed(0)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${destination.price.toFixed(0)}
                        <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">/ night</span>
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{destination.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No destinations found</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try another search term or come back after owners publish more destinations.
          </p>
        </div>
      )}
      
    </section>
  );
}


interface HotelsPageProps {
  tripData?: any;
  browseDestination?: any;
  onBack: () => void;
  onSelectHotel: (hotel: any) => void;
  setTripData?: React.Dispatch<React.SetStateAction<any>>;
}

const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isPromoActive = (promotion: any) => {
  const statusValue = String(promotion?.status ?? '').toLowerCase();
  const isActive = promotion?.is_active ?? statusValue === 'active';
  if (!isActive) return false;

  const endDate = promotion?.end_date || promotion?.expiry;
  if (!endDate) return true;

  const parsed = new Date(endDate);
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() >= Date.now();
};

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
};

const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600';

type CustomerHotel = Hotel & {
  has_promotion?: boolean;
  promotion?: any;
  discount_percentage?: number;
  discounted_price?: number;
  original_price?: number;
  status?: string;
  owner?: { id?: number; name?: string; email?: string };
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  destination_id?: number;
  created_at?: string | null;
};

const mapDestinationToHotel = (destination: any): CustomerHotel => {
  const priceFromPayload = destination?.price ?? destination?.original_price ?? destination?.discounted_price ?? 0;
  const normalizedBasePrice = parsePrice(priceFromPayload);
  const discountedPrice = parsePrice(destination?.discounted_price ?? destination?.price ?? normalizedBasePrice);
  const originalPrice = parsePrice(destination?.original_price ?? destination?.price ?? normalizedBasePrice);
  const normalizedId = Number(destination?.destination_id ?? destination?.id ?? Date.now());
  const resolvedId = Number.isFinite(normalizedId) ? normalizedId : Date.now();

  const galleryImage =
    (Array.isArray(destination?.images) && destination.images.find((img: string) => String(img || '').trim())) ?? '';
  const resolvedImage =
    String(destination?.image || galleryImage || '')
      .trim() || DEFAULT_HOTEL_IMAGE;

  return {
    id: resolvedId,
    destination_id: normalizedId,
    name: destination?.name ?? 'Luxury stay',
    location: destination?.location ?? 'Cambodia',
    price: discountedPrice,
    rating: Number(destination?.rating ?? 4.5),
    image: resolvedImage,
    description: destination?.description ?? destination?.type ?? '',
    amenities: Array.isArray(destination?.amenities) ? destination.amenities : [],
    type: destination?.type ?? 'Hotel',
    status: destination?.status ?? 'active',
    has_promotion: Boolean(destination?.has_promotion),
    promotion: destination?.promotion ?? null,
    discount_percentage: Number(destination?.discount_percentage ?? 0),
    discounted_price: discountedPrice,
    original_price: originalPrice,
    owner: destination?.owner ?? null,
    latitude: Number.isFinite(Number(destination?.latitude)) ? Number(destination.latitude) : null,
    longitude: Number.isFinite(Number(destination?.longitude)) ? Number(destination.longitude) : null,
    images: Array.isArray(destination?.images) ? destination.images : [],
    created_at: destination?.created_at ?? null,
  };
};

const formatHotelDate = (value?: string): string => {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return format(parsed, 'dd/MM/yyyy');
};

const formatDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return format(parsed, 'yyyy-MM-dd');
};

const parseDateInputValue = (value: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

const getOpenStreetMapSearchUrl = (query: string): string =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

const getOpenStreetMapEmbedUrl = (lat: number, lng: number, zoom = 11): string => {
  const delta = zoom >= 10 ? 0.12 : 0.35;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const getOpenStreetMapEmbedUrlForHotel = (hotel?: any | null): string => {
  if (!hotel) return getOpenStreetMapEmbedUrl(DEFAULT_SIDEBAR_MAP_CENTER.lat, DEFAULT_SIDEBAR_MAP_CENTER.lng);

  const lat =
    parseCoordinate(hotel?.latitude) ??
    parseCoordinate(hotel?.lat) ??
    parseLatLngFromText(String(hotel?.location || ''))?.lat ??
    DEFAULT_SIDEBAR_MAP_CENTER.lat;

  const lng =
    parseCoordinate(hotel?.longitude) ??
    parseCoordinate(hotel?.lng) ??
    parseLatLngFromText(String(hotel?.location || ''))?.lng ??
    DEFAULT_SIDEBAR_MAP_CENTER.lng;

  return getOpenStreetMapEmbedUrl(lat, lng, 11);
};

const getHotelArea = (location?: string): string =>
  String(location || '')
    .split(',')[0]
    ?.trim() || 'Central District';

const getHotelCountry = (location?: string): string => {
  const parts = String(location || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] || 'Cambodia';
};

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseLatLngFromText = (value: string): { lat: number; lng: number } | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const matches = raw.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return null;

  const lat = parseFloat(matches[0]);
  const lng = parseFloat(matches[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return { lat, lng };
};

const DEFAULT_SIDEBAR_MAP_CENTER = { lat: 11.5564, lng: 104.9282 };
const HOTEL_SEARCH_DATALIST_ID = 'hotel-search-location-options';

const getAmenityMeta = (amenity: string) => {
  const normalizedAmenity = normalizeSearchText(amenity);

  if (normalizedAmenity.includes('wifi')) {
    return { Icon: Wifi, label: 'Free WiFi' };
  }

  if (normalizedAmenity.includes('pool')) {
    return { Icon: Waves, label: amenity };
  }

  if (normalizedAmenity.includes('spa') || normalizedAmenity.includes('gym')) {
    return { Icon: Dumbbell, label: amenity };
  }

  if (
    normalizedAmenity.includes('breakfast') ||
    normalizedAmenity.includes('restaurant') ||
    normalizedAmenity.includes('dining')
  ) {
    return { Icon: Coffee, label: amenity };
  }

  return { Icon: CheckCircle2, label: amenity };
};

const DEFAULT_HOTEL_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000';

const parseCreatedAt = (value?: string | null): number => {
  if (!value) return 0;
  const parsed = new Date(value);
  const time = parsed.getTime();
  return Number.isFinite(time) ? time : 0;
};

const parseHotelCreatedAt = (value?: string | null): number => {
  if (!value) return 0;
  const parsed = new Date(value);
  const time = parsed.getTime();
  return Number.isFinite(time) ? time : 0;
};

export const Hotels: React.FC<HotelsPageProps> = ({ tripData, browseDestination, onBack, onSelectHotel, setTripData }) => {
  const [priceRange, setPriceRange] = useState(2000);
  const [searchQuery, setSearchQuery] = useState(() => String(browseDestination?.location || browseDestination?.name || '').trim());
  const [mapLocationQuery, setMapLocationQuery] = useState(
    () => String(browseDestination?.location || browseDestination?.name || '').trim()
  );
  const [showMap, setShowMap] = useState(false);
  const [selectedHotelForMap, setSelectedHotelForMap] = useState<any | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'recommended' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [savedHotelIds, setSavedHotelIds] = useState<Record<string, boolean>>({});
  const [expandedHotelGalleryIds, setExpandedHotelGalleryIds] = useState<Record<string, boolean>>({});
  const [hotels, setHotels] = useState<CustomerHotel[]>(getHotels());
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [hotelsError, setHotelsError] = useState('');
  const [searchDestinations, setSearchDestinations] = useState<any[]>([]);
  const [isDestinationPickerOpen, setIsDestinationPickerOpen] = useState(false);
  const [destinationPickerQuery, setDestinationPickerQuery] = useState('');
  const [isStayDatePickerOpen, setIsStayDatePickerOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState(() => formatDateInputValue(tripData?.startDate));
  const [checkOutDate, setCheckOutDate] = useState(() => formatDateInputValue(tripData?.endDate));
  const [stayDateError, setStayDateError] = useState('');
  const destinationPickerRef = React.useRef<HTMLDivElement | null>(null);
  const stayDatePickerRef = React.useRef<HTMLDivElement | null>(null);

  const t = (key: string): string => {
    const en: Record<string, string> = {
      curated_collection: 'Curated Collection',
      prestige_stays: 'The Prestige Stays',
      prestige_stays_desc: 'Discover signature hotels and resort experiences tailored for comfort, style, and unforgettable city views.',
      where_to_next: 'Where to next?',
      explore: 'Explore',
      home: 'Home',
      hotels_resorts: 'Hotels & Resorts',
      filters: 'Filters',
      nightly_rate: 'Nightly Rate',
      up_to: 'Up to',
      star_rating: 'Star Rating',
      stars: 'Stars',
      amenities: 'Amenities',
      view_on_map: 'View on Map',
      showing: 'Showing',
      property_singular: 'Property',
      property_plural: 'Properties',
      for_query: 'for',
      sort_by: 'Sort By',
      recommended: 'Recommended',
      exceptional_stay: 'Exceptional Stay',
      prestige_stay_badge: 'Prestige Stay',
      breakfast_included: 'Breakfast Included',
      quick_booking: 'Quick Booking',
      nights_estimate: 'Nights Estimate',
      night: 'Night',
      nights: 'Nights',
      room_type: 'Room Type',
      guests: 'Guests',
      night_suffix: '/night',
    };

    return en[key] ?? key;
  };

  useEffect(() => {
    let cancelled = false;
    setHotelsLoading(true);
    setHotelsError('');

    (async () => {
      const loadingStartedAt = Date.now();
      try {
        const [data, promotionResponse] = await Promise.all([
          getPublicDestinations(),
          getPublicPromotions().catch(() => []),
        ]);
        if (cancelled) return;
        const promotions = Array.isArray(promotionResponse) ? promotionResponse : [];
        const activePromotions = promotions.filter(isPromoActive);

        const promotionByDestinationId = new Map<number, any>();
        activePromotions.forEach((promotion: any) => {
          const linkedDestinations = Array.isArray(promotion?.linked_destinations) ? promotion.linked_destinations : [];
          linkedDestinations.forEach((linkedId: any) => {
            const numericId = Number(linkedId);
            if (Number.isFinite(numericId) && !promotionByDestinationId.has(numericId)) {
              promotionByDestinationId.set(numericId, promotion);
            }
          });
        });

        const normalized = (Array.isArray(data) ? data : []).map(mapDestinationToHotel).map((hotel: any) => {
          const promo = promotionByDestinationId.get(Number(hotel.id));
          return promo
            ? {
                ...hotel,
                has_promotion: true,
                promotion: promo,
              }
            : hotel;
        });
        if (!cancelled) {
          setHotels(normalized.length > 0 ? normalized : getHotels());
          setSearchDestinations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setHotelsError('Failed to load hotels. Showing curated collections.');
          setHotels(getHotels());
        }
      } finally {
        const elapsed = Date.now() - loadingStartedAt;
        const remaining = Math.max(0, 1000 - elapsed);
        window.setTimeout(() => {
          if (!cancelled) {
            setHotelsLoading(false);
          }
        }, remaining);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDestinationPickerOpen) return;

    let cancelled = false;
    getPublicDestinations()
      .then((data) => {
        if (!cancelled) setSearchDestinations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSearchDestinations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isDestinationPickerOpen]);

  useEffect(() => {
    const destinationQuery = String(
      browseDestination?.location ||
      browseDestination?.name ||
      '',
    ).trim();

    if (!destinationQuery) return;

    setSearchQuery(destinationQuery);
    setMapLocationQuery(destinationQuery);
  }, [browseDestination?.location, browseDestination?.name]);

  const tripNights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(`${checkOutDate}T00:00:00`).getTime() - new Date(`${checkInDate}T00:00:00`).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : getTripNights(tripData);
  const stayWindowLabel =
    checkInDate && checkOutDate
      ? `${formatHotelDate(`${checkInDate}T00:00:00`)} - ${formatHotelDate(`${checkOutDate}T00:00:00`)}`
      : 'Set dates';
  const priceCeiling = React.useMemo(() => {
    const highestPrice = hotels.reduce((max, hotel) => Math.max(max, parsePrice(hotel.price)), 0);
    return Math.max(500, Math.ceil(highestPrice / 50) * 50);
  }, [hotels]);
  const areaOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          hotels
            .map((hotel) => getHotelArea(hotel.location))
            .filter(Boolean),
        ),
      ).slice(0, 4),
    [hotels],
  );
  const amenityOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          hotels.flatMap((hotel) => (Array.isArray(hotel.amenities) ? hotel.amenities.filter(Boolean) : [])),
        ),
      ).slice(0, 4),
    [hotels],
  );

  useEffect(() => {
    setPriceRange((previous) => Math.min(Math.max(previous, 100), priceCeiling));
  }, [priceCeiling]);

  const destinationSearchIndex = React.useMemo(() => {
    const byArea = new Map<string, string>();
    const byExactLocation = new Map<string, string>();

    searchDestinations.forEach((destination) => {
      const destinationText = normalizeSearchText(String(destination.location || ''));
      if (!destinationText) return;

      const areaKey = normalizeSearchText(getHotelArea(destination.location));
      if (areaKey) {
        byArea.set(areaKey, `${byArea.get(areaKey) || ''} ${destinationText}`.trim());
      }

      const locationKey = normalizeSearchText(String(destination.location || ''));
      if (locationKey) {
        byExactLocation.set(locationKey, `${byExactLocation.get(locationKey) || ''} ${destinationText}`.trim());
      }
    });

    return { byArea, byExactLocation };
  }, [searchDestinations]);

  const queryTokens = normalizeSearchText(searchQuery).trim().split(/\s+/).filter(Boolean);
  const matchesHotelQuery = React.useCallback((hotel: CustomerHotel | Hotel) => {
    if (queryTokens.length === 0) return true;

    const hotelAreaKey = normalizeSearchText(getHotelArea(hotel.location));
    const hotelLocationKey = normalizeSearchText(String(hotel.location || ''));
    const relatedDestinationText = [
      destinationSearchIndex.byArea.get(hotelAreaKey) || '',
      destinationSearchIndex.byExactLocation.get(hotelLocationKey) || '',
    ].join(' ');

    const searchableText = normalizeSearchText(
      [hotel.name, hotel.location, getHotelArea(hotel.location), relatedDestinationText].join(' ')
    );

    return queryTokens.every((token) => searchableText.includes(token));
  }, [destinationSearchIndex, queryTokens]);

  const matchesCurrentFilters = React.useCallback((hotel: CustomerHotel | Hotel) => {
    if (parsePrice(hotel.price) > priceRange) return false;

    if (selectedStars !== null) {
      const hotelRating = typeof hotel.rating === 'number' ? hotel.rating : parseFloat(String(hotel.rating)) || 0;
      if (hotelRating < selectedStars) return false;
    }

    if (selectedAreas.length > 0) {
      const areaLabel = normalizeSearchText(getHotelArea(hotel.location));
      const matchesArea = selectedAreas.some((area) => areaLabel === normalizeSearchText(area));
      if (!matchesArea) return false;
    }

    if (selectedAmenities.length > 0) {
      const hotelAmenities = (hotel.amenities ?? []).map((amenity) => normalizeSearchText(amenity));
      const matchesAmenities = selectedAmenities.every((amenity) =>
        hotelAmenities.includes(normalizeSearchText(amenity))
      );
      if (!matchesAmenities) return false;
    }

    return matchesHotelQuery(hotel);
  }, [matchesHotelQuery, priceRange, selectedAmenities, selectedAreas, selectedStars]);

  const filteredHotels = React.useMemo(() => {
    const primaryMatches = hotels.filter(matchesCurrentFilters);
    if (primaryMatches.length > 0 || queryTokens.length === 0) {
      return primaryMatches;
    }

    // If the live API data doesn't have a city match, fall back to the curated hotel set
    // so searched locations like Siem Reap still show real stays instead of an empty page.
    const fallbackMatches = getHotels().filter(matchesCurrentFilters);
    return fallbackMatches.length > 0 ? fallbackMatches : primaryMatches;
  }, [hotels, matchesCurrentFilters, queryTokens.length]);

  const sortedHotels = React.useMemo(() => {
    const items = [...filteredHotels];

    items.sort((left, right) => {
      if (sortBy === 'newest') return parseHotelCreatedAt(right.created_at) - parseHotelCreatedAt(left.created_at);
      if (sortBy === 'price-low') return parsePrice(left.price) - parsePrice(right.price);
      if (sortBy === 'price-high') return parsePrice(right.price) - parsePrice(left.price);
      if (sortBy === 'rating') return right.rating - left.rating;
      return right.rating * 100 - left.rating * 100 + (parsePrice(left.price) - parsePrice(right.price)) * 0.05;
    });

    return items;
  }, [filteredHotels, sortBy]);
  const regionLabel = React.useMemo(
    () =>
      String(
        browseDestination?.name ||
          browseDestination?.location ||
          selectedAreas[0] ||
          getHotelArea(sortedHotels[0]?.location || hotels[0]?.location),
      )
        .split(',')[0]
        ?.trim() || 'Cambodia',
    [browseDestination?.location, browseDestination?.name, hotels, selectedAreas, sortedHotels],
  );
  const countryLabel = React.useMemo(
    () => getHotelCountry(String(browseDestination?.location || sortedHotels[0]?.location || hotels[0]?.location || 'Cambodia')),
    [browseDestination?.location, hotels, sortedHotels],
  );
  const hotelBannerImage = React.useMemo(() => {
    const destinationImage = String(browseDestination?.image || browseDestination?.images?.[0] || '').trim();
    if (destinationImage) return destinationImage;

    const featuredHotel = hotels.find((hotel) => String(hotel.image || hotel.images?.[0] || '').trim().length > 0);
    return String(featuredHotel?.image || featuredHotel?.images?.[0] || DEFAULT_HOTEL_BANNER_IMAGE);
  }, [browseDestination?.image, browseDestination?.images, hotels]);
  const heroLocationLabel = React.useMemo(() => {
    if (!countryLabel || normalizeSearchText(countryLabel) === normalizeSearchText(regionLabel)) {
      return regionLabel;
    }

    return `${regionLabel}, ${countryLabel}`;
  }, [countryLabel, regionLabel]);

  useEffect(() => {
    setMapLocationQuery((previous) => (previous.trim() ? previous : heroLocationLabel));
  }, [heroLocationLabel]);

  useEffect(() => {
    if (!isDestinationPickerOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (destinationPickerRef.current && !destinationPickerRef.current.contains(target)) {
        setIsDestinationPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDestinationPickerOpen]);

  useEffect(() => {
    const nextCheckIn = formatDateInputValue(tripData?.startDate);
    const nextCheckOut = formatDateInputValue(tripData?.endDate);
    setCheckInDate(nextCheckIn);
    setCheckOutDate(nextCheckOut);
  }, [tripData?.startDate, tripData?.endDate]);

  useEffect(() => {
    if (!isStayDatePickerOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (stayDatePickerRef.current && !stayDatePickerRef.current.contains(target)) {
        setIsStayDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isStayDatePickerOpen]);

  const destinationPickerOptions = React.useMemo(() => {
    const fromDestinations = searchDestinations.flatMap((destination) => [
      String(destination.location || '').trim(),
      getHotelArea(destination.location),
    ]);
    const fromHotels = hotels.flatMap((hotel) => [
      String(hotel.location || '').trim(),
      getHotelArea(hotel.location),
    ]);
    const seeds = [mapLocationQuery, heroLocationLabel, ...fromDestinations, ...fromHotels]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    return Array.from(new Set(seeds)).slice(0, 40);
  }, [heroLocationLabel, hotels, mapLocationQuery, searchDestinations]);

  const areaCoordinatesByLabel = React.useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; location: string }>();
    const addCoordinate = (
      locationValue: unknown,
      latitudeValue: unknown,
      longitudeValue: unknown,
      aliases: Array<string | undefined> = [],
    ) => {
      const locationLabel = String(locationValue || '').trim();
      const lat = parseCoordinate(latitudeValue);
      const lng = parseCoordinate(longitudeValue);

      if (!locationLabel || lat === null || lng === null) return;

      const keys = [locationLabel, getHotelArea(locationLabel), ...aliases]
        .map((key) => normalizeSearchText(String(key || '').trim()))
        .filter(Boolean);

      keys.forEach((key) => {
        if (!map.has(key)) {
          map.set(key, { lat, lng, location: locationLabel });
        }
      });
    };

    hotels.forEach((hotel: any) => {
      addCoordinate(hotel.location, hotel.latitude, hotel.longitude, [hotel.name]);
    });

    searchDestinations.forEach((destination: any) => {
      addCoordinate(destination.location, destination.latitude, destination.longitude, [destination.name]);
    });

    return map;
  }, [hotels, searchDestinations]);

  const selectedMapLocation = React.useMemo(() => {
    const searchValue = String(selectedAreas[0] || mapLocationQuery || regionLabel).trim();
    const normalizedSearch = normalizeSearchText(searchValue);

    if (!normalizedSearch) return null;

    const typedLatLng = parseLatLngFromText(searchValue);
    if (typedLatLng) {
      return {
        lat: typedLatLng.lat,
        lng: typedLatLng.lng,
        location: searchValue,
      };
    }

    const exactMatch = areaCoordinatesByLabel.get(normalizedSearch);
    if (exactMatch) {
      return exactMatch;
    }

    for (const [areaKey, coordinate] of areaCoordinatesByLabel.entries()) {
      if (
        areaKey.includes(normalizedSearch) ||
        normalizeSearchText(coordinate.location).includes(normalizedSearch)
      ) {
        return coordinate;
      }
    }

    return areaCoordinatesByLabel.values().next().value ?? null;
  }, [areaCoordinatesByLabel, mapLocationQuery, regionLabel, selectedAreas]);

  const selectedMapDisplay = React.useMemo(() => {
    if (selectedMapLocation) return selectedMapLocation;

    const fallbackLocation = String(selectedAreas[0] || mapLocationQuery || regionLabel || 'Cambodia').trim() || 'Cambodia';
    return {
      lat: DEFAULT_SIDEBAR_MAP_CENTER.lat,
      lng: DEFAULT_SIDEBAR_MAP_CENTER.lng,
      location: fallbackLocation,
    };
  }, [mapLocationQuery, regionLabel, selectedAreas, selectedMapLocation]);

  const selectedMapCenter = { lat: selectedMapDisplay.lat, lng: selectedMapDisplay.lng };
  const selectedMapZoom = selectedMapLocation ? 11 : 6;
  const selectedMapEmbedUrl = getOpenStreetMapEmbedUrl(selectedMapCenter.lat, selectedMapCenter.lng, selectedMapZoom);

  const visibleDestinationPickerOptions = React.useMemo(() => {
    const normalizedQuery = normalizeSearchText(destinationPickerQuery).trim();
    if (!normalizedQuery) return destinationPickerOptions;

    return destinationPickerOptions.filter((option) =>
      normalizeSearchText(option).includes(normalizedQuery)
    );
  }, [destinationPickerOptions, destinationPickerQuery]);

  const applyDestinationFromPicker = (value?: string) => {
    const selectedLocation = String((value ?? destinationPickerQuery) || mapLocationQuery || heroLocationLabel).trim();
    if (!selectedLocation) return;

    setMapLocationQuery(selectedLocation);
    setSearchQuery(selectedLocation);
    setDestinationPickerQuery(selectedLocation);
    setIsDestinationPickerOpen(false);
    document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyStayDates = () => {
    const nextCheckIn = parseDateInputValue(checkInDate);
    const nextCheckOut = parseDateInputValue(checkOutDate);

    if (!nextCheckIn || !nextCheckOut) {
      setStayDateError('Please choose both check-in and check-out before applying.');
      return;
    }

    const startDate = nextCheckIn <= nextCheckOut ? nextCheckIn : nextCheckOut;
    const endDate = nextCheckIn <= nextCheckOut ? nextCheckOut : nextCheckIn;
    const nextDatesLabel = `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    setStayDateError('');

    setTripData?.((previous: any) => {
      const next = { ...(previous || {}) };
      next.startDate = startDate.toISOString();
      next.endDate = endDate.toISOString();
      next.dates = nextDatesLabel;
      return next;
    });

    try {
      const stored = sessionStorage.getItem('customer_trip_data');
      const parsed = stored ? JSON.parse(stored) : {};
      const nextStored = {
        ...(parsed || {}),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dates: nextDatesLabel,
      };
      sessionStorage.setItem('customer_trip_data', JSON.stringify(nextStored));
    } catch {
      /* ignore storage errors */
    }

    setIsStayDatePickerOpen(false);
  };

  const openMapForQuery = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    window.open(getOpenStreetMapSearchUrl(trimmedQuery), '_blank', 'noopener,noreferrer');
  };

  const openHotelMapChooser = (query: string) => {
    const trimmedQuery = query.trim();
    const params = new URLSearchParams();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    const directLatLng = parseLatLngFromText(trimmedQuery);
    if (directLatLng) {
      params.set('lat', String(directLatLng.lat));
      params.set('lng', String(directLatLng.lng));
    } else if (selectedMapLocation) {
      params.set('lat', String(selectedMapLocation.lat));
      params.set('lng', String(selectedMapLocation.lng));
    }

    params.set('type', 'all');
    window.location.assign(`/map?${params.toString()}`);
  };

  const openMapForHotel = (hotel: any) => {
    const hotelName = String(hotel?.name || '').trim();
    const hotelLocation = String(hotel?.location || '').trim();
    const query = [hotelName, hotelLocation].filter(Boolean).join(', ');
    if (!query) return;
    openMapForQuery(query);
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const openHotelWithSelection = (hotel: any) => {
    const effectivePrice = parsePrice(hotel?.discounted_price ?? hotel?.price ?? 0);
    const originalPrice = parsePrice(hotel?.original_price ?? hotel?.price ?? effectivePrice);
    setSelectedHotelForMap(hotel);
    setShowMap(true);
    onSelectHotel({
      ...hotel,
      price: effectivePrice,
      discounted_price: effectivePrice,
      original_price: originalPrice,
      discount_percentage: hotel?.discount_percentage,
      has_promotion: hotel?.has_promotion,
      promotion: hotel?.promotion,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-16 pt-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:bg-slate-900/70 sm:p-6 lg:p-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <button type="button" onClick={onBack} className="transition-colors hover:text-blue-600">
              {t('home')}
            </button>
            <span>&gt;</span>
            <span>{countryLabel}</span>
            <span>&gt;</span>
            <span className="text-slate-900 dark:text-white">{regionLabel} Hotels</span>
          </nav>

          <section className="relative z-30 mb-7 overflow-visible rounded-[1.8rem] border border-slate-200 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] dark:border-slate-800">
            <div className="relative min-h-screen flex flex-col justify-center">
              <img
                src={hotelBannerImage}
                alt={`${regionLabel} hotel banner`}
                className="absolute inset-0 h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-950/80" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.35),transparent_55%)]" />

              <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 flex flex-col justify-center items-center text-center h-full">
                <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-white/70">{t('curated_collection')}</p>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.8rem]">
                  {t('prestige_stays')}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
                  {t('prestige_stays_desc')}
                </p>

                <div className="mt-7 w-full max-w-5xl grid gap-2 rounded-[1.5rem] bg-white/95 p-2 shadow-2xl shadow-slate-900/20 backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_auto] dark:bg-slate-950/90 dark:shadow-none">
                  <label className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900">
                    <Search className="h-5 w-5 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t('where_to_next')}</p>
                      <input
                        type="text"
                        value={searchQuery || ''}
                        onChange={(event) => {
                          const nextValue = String(event.target.value || '');
                          setSearchQuery(nextValue);
                          if (nextValue.trim()) {
                            setMapLocationQuery(nextValue);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            openHotelMapChooser(searchQuery || mapLocationQuery || heroLocationLabel);
                          }
                        }}
                        list={HOTEL_SEARCH_DATALIST_ID}
                        placeholder="Search by location"
                        className="w-full appearance-none border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none ring-0 shadow-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 dark:text-white"
                      />
                      <datalist id={HOTEL_SEARCH_DATALIST_ID}>
                        {destinationPickerOptions.map((option) => (
                          <option key={`search-${option}`} value={option} />
                        ))}
                      </datalist>
                    </div>
                  </label>

                  <div ref={destinationPickerRef} className="relative min-w-0">
                    <button
                      type="button"
                      aria-expanded={isDestinationPickerOpen}
                      aria-controls="destination-picker-menu"
                      onClick={() => {
                        setDestinationPickerQuery(mapLocationQuery || heroLocationLabel);
                        setIsDestinationPickerOpen((previous) => !previous);
                      }}
                      className="flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900"
                    >
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t('view_on_map')}</p>
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {mapLocationQuery || heroLocationLabel}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          isDestinationPickerOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDestinationPickerOpen ? (
                      <div
                        id="destination-picker-menu"
                        className="absolute left-0 top-[calc(100%+0.5rem)] z-[70] w-full min-w-[260px] rounded-2xl border border-slate-700/60 bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur"
                      >
                        <div className="mb-2 flex items-center gap-2 rounded-xl border border-blue-500/70 bg-slate-900 px-3 py-2.5">
                          <Search className="h-4 w-4 text-slate-400" />
                          <input
                            autoFocus
                            type="text"
                            value={destinationPickerQuery}
                            onChange={(event) => setDestinationPickerQuery(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                applyDestinationFromPicker();
                              }
                            }}
                            placeholder={heroLocationLabel}
                            className="w-full appearance-none border-0 bg-transparent p-0 text-sm font-medium text-white outline-none ring-0 shadow-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>

                        <div className="max-h-48 space-y-1 overflow-y-auto py-1">
                          {destinationPickerQuery.trim() &&
                          !visibleDestinationPickerOptions.some(
                            (option) =>
                              normalizeSearchText(option) === normalizeSearchText(destinationPickerQuery),
                          ) ? (
                            <button
                              type="button"
                              onClick={() => applyDestinationFromPicker(destinationPickerQuery)}
                              className="flex w-full items-center gap-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-2 text-left text-sm text-blue-100 transition-colors hover:bg-blue-500/20"
                            >
                              <MapPin className="h-4 w-4 text-blue-300" />
                              <span className="truncate">Use: {destinationPickerQuery}</span>
                            </button>
                          ) : null}
                          {visibleDestinationPickerOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => applyDestinationFromPicker(option)}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                normalizeSearchText(option) === normalizeSearchText(mapLocationQuery)
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                              }`}
                            >
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span className="truncate">{option}</span>
                            </button>
                          ))}
                          {visibleDestinationPickerOptions.length === 0 ? (
                            <p className="px-2.5 py-2 text-xs text-slate-500">No destinations found.</p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => applyDestinationFromPicker()}
                          className="mt-2 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-slate-900 transition-colors hover:bg-slate-100"
                        >
                          Apply Destination
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div ref={stayDatePickerRef} className="relative min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsStayDatePickerOpen((previous) => !previous)}
                      className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900"
                    >
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Check-in / Check-out</p>
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{stayWindowLabel}</p>
                      </div>
                    </button>

                    {isStayDatePickerOpen ? (
                      <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[70] w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Check-in
                            </span>
                            <input
                              type="date"
                              value={checkInDate}
                              onChange={(event) => {
                                setCheckInDate(event.target.value);
                                setStayDateError('');
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Check-out
                            </span>
                            <input
                              type="date"
                              value={checkOutDate}
                              onChange={(event) => {
                                setCheckOutDate(event.target.value);
                                setStayDateError('');
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                          </label>
                        </div>

                        {stayDateError ? (
                          <p className="mt-3 text-xs font-medium text-red-500">{stayDateError}</p>
                        ) : (
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Choose both dates before applying.
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckInDate('');
                              setCheckOutDate('');
                              setStayDateError('');
                            }}
                            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            Clear
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsStayDatePickerOpen(false)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={applyStayDates}
                              disabled={!checkInDate || !checkOutDate}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                            >
                              Apply Dates
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    {t('explore')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-5 sticky top-20 self-start">
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 xl:overflow-hidden xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)]">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('filters')}</h2>
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-6">
                  <section className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Location Map</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {selectedMapDisplay.location}
                    </p>

                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <iframe
                        title={`OpenStreetMap for ${selectedMapDisplay.location}`}
                        src={selectedMapEmbedUrl}
                        className="h-[190px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {`Lat ${selectedMapCenter.lat.toFixed(6)}, Lng ${selectedMapCenter.lng.toFixed(6)}`}
                    </p>
                    <a
                      href={getOpenStreetMapSearchUrl(selectedMapDisplay.location)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-[11px] font-medium text-blue-600 hover:text-blue-500"
                    >
                      Open in OpenStreetMap
                    </a>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Filter className="h-4 w-4 text-slate-400" />
                      Price per night
                    </div>
                    <input
                      type="range"
                      min="100"
                      max={priceCeiling}
                      step="25"
                      value={priceRange}
                      onChange={(event) => setPriceRange(parseInt(event.target.value, 10))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-blue-600 dark:bg-slate-800"
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>$0</span>
                      <span>${priceRange}+</span>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t('star_rating')}</h3>
                    <div className="flex gap-2">
                      {[3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedStars((previous) => (previous === star ? null : star))}
                          className={`min-w-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            selectedStars === star
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Popular Areas</h3>
                    <div className="space-y-2.5">
                      {areaOptions.map((area) => (
                        <label key={area} className="flex cursor-pointer items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area)}
                            onChange={() =>
                              setSelectedAreas((previous) =>
                                previous.includes(area)
                                  ? previous.filter((item) => item !== area)
                                  : [...previous, area]
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0 flex-1">
                            <span>{area}</span>
                            {areaCoordinatesByLabel.get(normalizeSearchText(area)) ? (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                Lat {areaCoordinatesByLabel.get(normalizeSearchText(area))?.lat.toFixed(4)}, Lng {areaCoordinatesByLabel.get(normalizeSearchText(area))?.lng.toFixed(4)}
                              </p>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t('amenities')}</h3>
                    <div className="space-y-2.5">
                      {amenityOptions.map((amenity) => (
                        <label key={amenity} className="flex cursor-pointer items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() =>
                              setSelectedAmenities((previous) =>
                                previous.includes(amenity)
                                  ? previous.filter((item) => item !== amenity)
                                  : [...previous, amenity]
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-full rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-200"
                  >
                    Apply All Filters
                  </button>
                </div>
              </div>
            </aside>

            <div id="hotel-results" className="space-y-5">
              <div className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <span>{countryLabel}</span>
                    <span>&gt;</span>
                    <span>{regionLabel}</span>
                  </div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    All Hotels
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {sortedHotels.length} {sortedHotels.length === 1 ? 'property' : 'properties'} found for {stayWindowLabel}
                  </p>
                </div>

                <label className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t('sort_by')}</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as 'newest' | 'recommended' | 'price-low' | 'price-high' | 'rating')}
                    className="bg-transparent font-semibold text-slate-900 outline-none dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="recommended">{t('recommended')}</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                {hotelsLoading && (
                  <div className="flex items-center justify-center rounded-[1.6rem] border border-slate-200 bg-white px-5 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />
                    </div>
                  </div>
                )}

                {hotelsError && !hotelsLoading && (
                  <div className="rounded-[1.6rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                    {hotelsError}
                  </div>
                )}

                {!hotelsLoading && !hotelsError && sortedHotels.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {sortedHotels.map((hotel, index) => {
                      const hotelKey = String(hotel.id);
                      const hotelImage = hotel.image || hotel.images?.[0] || '';
                      const effectiveNightlyPrice = parsePrice(hotel.discounted_price ?? hotel.price);
                      const originalNightlyPrice = parsePrice(hotel.original_price ?? hotel.price);
                      const hasDiscount = Boolean(hotel.has_promotion && originalNightlyPrice > effectiveNightlyPrice);
                      const nightlyPrice = effectiveNightlyPrice;
                      const quickTotal = nightlyPrice * tripNights;
                      const ratingValue = typeof hotel.rating === 'number' ? hotel.rating : parseFloat(String(hotel.rating)) || 0;
                      const visualIndex = index;
                      const topAmenities = (hotel.amenities ?? []).slice(0, 3);
                      const saved = Boolean(savedHotelIds[hotelKey]);
                      const isGalleryExpanded = Boolean(expandedHotelGalleryIds[hotelKey]);
                      const galleryImages = Array.isArray(hotel.images)
                        ? hotel.images
                            .map((image) => String(image || '').trim())
                            .filter(Boolean)
                            .slice(0, 4)
                        : [];
                      const displayImages = [
                        hotelImage,
                        ...galleryImages,
                      ]
                        .map((image) => String(image || '').trim())
                        .filter(Boolean)
                        .filter((image, imageIndex, items) => items.indexOf(image) === imageIndex)
                        .slice(0, 4);
                      const extraImages = displayImages.slice(1, 4);

                      return (
                        <article
                          key={hotel.id}
                          className="flex h-full w-full flex-col rounded-[1.35rem] border border-slate-200 bg-white p-2.5 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950 sm:p-3"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="relative overflow-hidden rounded-[1rem]">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHotelGalleryIds((previous) => ({
                                    ...previous,
                                    [hotelKey]: !previous[hotelKey],
                                  }))
                                }
                                className="block w-full text-left"
                                aria-label={isGalleryExpanded ? `Collapse ${hotel.name} photos` : `Expand ${hotel.name} photos`}
                              >
                                <img
                                  src={displayImages[0] || hotelImage}
                                  alt={hotel.name}
                                  className="h-40 w-full object-cover sm:h-48"
                                  referrerPolicy="no-referrer"
                                />
                              </button>
                              {displayImages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedHotelGalleryIds((previous) => ({
                                      ...previous,
                                      [hotelKey]: !previous[hotelKey],
                                    }))
                                  }
                                  className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-slate-900"
                                >
                                  {isGalleryExpanded ? 'Show less' : `${extraImages.length} more photos`}
                                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isGalleryExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                              {isGalleryExpanded && extraImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-1 border-t border-white/10 bg-white p-1 sm:p-1.5 dark:bg-slate-950">
                                  {extraImages.map((image, imageIndex) => (
                                    <button
                                      key={`${hotel.id}-extra-${imageIndex}-${image}`}
                                      type="button"
                                      onClick={() =>
                                        setExpandedHotelGalleryIds((previous) => ({
                                          ...previous,
                                          [hotelKey]: false,
                                        }))
                                      }
                                      className="overflow-hidden rounded-lg"
                                      aria-label={`Collapse gallery for ${hotel.name}`}
                                    >
                                      <img
                                        src={image}
                                        alt={`${hotel.name} photo ${imageIndex + 2}`}
                                        className="h-20 w-full object-cover sm:h-24"
                                        referrerPolicy="no-referrer"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                              <button
                                type="button"
                                aria-label={saved ? `Remove ${hotel.name} from saved stays` : `Save ${hotel.name}`}
                                onClick={() =>
                                  setSavedHotelIds((previous) => ({
                                    ...previous,
                                    [hotelKey]: !previous[hotelKey],
                                  }))
                                }
                                className="absolute right-2.5 top-2.5 rounded-full bg-white/95 p-1.5 text-slate-400 shadow-sm transition-colors hover:text-rose-500"
                              >
                                <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </button>
                            </div>

                            <div className="flex flex-1 flex-col gap-3 px-0.5 py-0.5 sm:px-1.5">
                              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                <div className="space-y-2.5">
                                  <div className="flex flex-wrap items-center gap-1.5 text-amber-400">
                                    {[...Array(Math.max(3, Math.min(5, Math.round(ratingValue) || 4)))].map((_, starIndex) => (
                                      <Star key={`${hotel.id}-star-${starIndex}`} className="h-3.5 w-3.5 fill-current" />
                                    ))}
                                    <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                      {ratingValue.toFixed(1)}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => openHotelWithSelection(hotel)}
                                    className="text-left text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-blue-600 dark:text-white sm:text-[1.7rem]"
                                  >
                                    {hotel.name}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openMapForHotel(hotel)}
                                    className="flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 sm:text-sm"
                                  >
                                    <MapPin className="h-4 w-4" />
                                    <span>{hotel.location}</span>
                                  </button>

                                  {hasDiscount && hotel.discount_percentage ? (
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                      <Sparkles className="h-3.5 w-3.5" />
                                      Save {hotel.discount_percentage}% today
                                    </div>
                                  ) : null}
                                  <div className="flex flex-wrap gap-2">
                                    {topAmenities.map((amenity) => {
                                      const { Icon, label } = getAmenityMeta(amenity);

                                      return (
                                        <span
                                          key={`${hotel.id}-${amenity}`}
                                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                                        >
                                          <Icon className="h-3.5 w-3.5" />
                                          {label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="rounded-[1rem] bg-slate-50 px-3 py-2.5 text-right dark:bg-slate-900/80 xl:min-w-[130px]">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Per night / excl. tax
                                  </p>
                                  <p className="mt-1 text-[2rem] font-extrabold leading-none text-slate-900 dark:text-white">
                                    ${nightlyPrice}
                                  </p>
                                  {hasDiscount && originalNightlyPrice > nightlyPrice && (
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 line-through">
                                      ${originalNightlyPrice}
                                    </p>
                                  )}
                                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {tripNights} {tripNights === 1 ? t('night') : t('nights')}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-2.5 sm:grid-cols-2">
                                <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Total stay
                                      </p>
                                      <p className="mt-1 text-[13px] font-semibold text-slate-900 dark:text-white sm:text-sm">
                                        ${quickTotal}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <BedDouble className="h-3.5 w-3.5 text-blue-600" />
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {t('nights_estimate')}
                                      </p>
                                      <p className="mt-1 text-[13px] font-semibold text-slate-900 dark:text-white sm:text-sm">
                                        {tripNights} {tripNights === 1 ? t('night') : t('nights')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">
                                {hotel.description || ''}
                              </p>

                              <div className="mt-auto flex flex-col gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:text-xs">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {getHotelArea(hotel.location)}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openHotelWithSelection(hotel)}
                                  className={`rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-colors sm:text-sm ${
                                    visualIndex % 2 === 1
                                      ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                                      : 'bg-blue-600 hover:bg-blue-500'
                                  }`}
                                >
                                  View Selection
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {!hotelsLoading && !hotelsError && sortedHotels.length === 0 && (
                  <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No stays found</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Try widening your filters or picking another destination.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMap && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowMap(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Hotel location map"
          >
            <div
              className="relative h-[80vh] w-[90vw] rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
              onClick={(event) => event.stopPropagation()}
            >


              <button 
                type="button"
                onClick={() => setShowMap(false)}
                className="absolute right-3 top-3 rounded-full bg-slate-200 p-1 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
              
              <iframe
                title={`Map for ${selectedHotelForMap?.name || 'selected hotel'}`}  
                src={getOpenStreetMapEmbedUrlForHotel(selectedHotelForMap)}
                className="h-full w-full rounded-xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {!selectedHotelForMap && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                  Select a hotel to preview its map location.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}





