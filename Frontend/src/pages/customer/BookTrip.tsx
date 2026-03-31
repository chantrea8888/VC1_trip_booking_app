import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { getPublicDestinations } from '../../services/destinationService';
import { getPublicPromotions } from '@/services/promotionService';

type DestinationOption = {
  id: number;
  name: string;
  location: string;
};

type TransportOption = {
  id: number;
  name: string;
  type: string;
  is_free: boolean;
};

const buildBookingId = () => `BK-${Date.now()}`;

const toDateInputValue = (value: Date) => {
  const date = new Date(value);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const parsePositiveInteger = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseBooleanFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
};

export const BookTrip: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [destinationId, setDestinationId] = React.useState<number | null>(null);
  const [destinations, setDestinations] = React.useState<Array<{
    id: number;
    name: string;
    location: string;
    price: number;
  }>>([]);
  const [destinationError, setDestinationError] = React.useState<string | null>(null);
  const [loadingDestinations, setLoadingDestinations] = React.useState(false);
  const [transportId, setTransportId] = React.useState<number | null>(null);
  const [transports, setTransports] = React.useState<Array<{
    id: number;
    name: string;
    type: string;
    is_free: boolean;
    price_per_km?: number;
  }>>([]);
  const [transportError, setTransportError] = React.useState<string | null>(null);
  const [loadingTransports, setLoadingTransports] = React.useState(false);
  const [travelDate, setTravelDate] = React.useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return toDateInputValue(date);
  });
  const [travelers, setTravelers] = React.useState<number>(2);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [promotions, setPromotions] = React.useState<any[]>([]);

  const toDateStart = React.useCallback((value?: string | null) => {
    if (!value) return null;
    const raw = String(value);
    const normalized = raw.includes('T') ? raw : `${raw}T00:00:00`;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  const toDateEnd = React.useCallback((value?: string | null) => {
    if (!value) return null;
    const raw = String(value);
    const normalized = raw.includes('T') ? raw : `${raw}T23:59:59.999`;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  const isPromotionActive = React.useCallback((promo: any) => {
    const statusValue = String(promo?.status ?? '').toLowerCase();
    const isActive = promo?.is_active ?? statusValue === 'active';
    if (!isActive) return false;
    const now = new Date();
    const startRaw = promo.start_date ?? promo.startDate ?? null;
    const endRaw = promo.end_date ?? promo.endDate ?? promo.expiry ?? null;
    const startDate = toDateStart(startRaw);
    const endDate = toDateEnd(endRaw);
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    return true;
  }, [toDateStart, toDateEnd]);

  const loadTransports = React.useCallback(async () => {
    setLoadingTransports(true);
    setTransportError(null);

    try {
      const response = (await apiRequest('/transports')) as { data?: any[] };
      const mapped = (response?.data ?? [])
        .map((item: any) => {
          const id = parsePositiveInteger(item?.transport_id ?? item?.id);
          const name = String(item?.service_name ?? item?.name ?? '').trim();
          if (!id || !name) return null;

          const rawType = String(item?.transport_type ?? item?.type ?? 'Car Rental');
          const type = rawType === 'Shuttle' ? 'Train' : rawType === 'Other' ? 'Car Rental' : rawType;

          return {
            id,
            name,
            type: String(type),
            is_free: Boolean(item?.is_free ?? item?.isFree ?? false),
            price_per_km: item?.price_per_km ? Number(item.price_per_km) : undefined,
          };
        })
        .filter((item): item is TransportOption => item !== null);

      setTransports(mapped);
    } catch (err: any) {
      setTransportError(err?.data?.message ?? err?.message ?? 'Failed to load transports.');
    } finally {
      setLoadingTransports(false);
    }
  }, []);

  // Get active promotion for destination
  const getActivePromotionForDestination = React.useCallback((destinationId: number) => {
    return promotions.find((promo: any) => {
      if (!isPromotionActive(promo)) return false;
      const linkedDestinations = promo.linked_destinations || [];
      return linkedDestinations.includes(destinationId);
    }) || null;
  }, [promotions, isPromotionActive]);

  // Get active promotion for transport
  const getActivePromotionForTransport = React.useCallback((transportId: number) => {
    return promotions.find((promo: any) => {
      if (!isPromotionActive(promo)) return false;
      const linkedTransports = promo.linked_transports || [];
      return linkedTransports.includes(transportId);
    }) || null;
  }, [promotions, isPromotionActive]);

  // Calculate discounted price
  const calculateDiscountedPrice = React.useCallback((basePrice: number, promotion: any) => {
    if (!promotion?.discount) return basePrice;
    
    const discount = promotion.discount.trim();
    
    if (discount.endsWith('%')) {
      const percent = parseFloat(discount.replace('%', ''));
      if (Number.isFinite(percent)) {
        return Math.max(0, basePrice - (basePrice * percent / 100));
      }
    }
    
    if (discount.startsWith('$')) {
      const amount = parseFloat(discount.replace('$', ''));
      if (Number.isFinite(amount)) {
        return Math.max(0, basePrice - amount);
      }
    }
    
    return basePrice;
  }, []);

  React.useEffect(() => {
    const loadDestinations = async () => {
      setLoadingDestinations(true);
      setDestinationError(null);

      try {
        const data = await getPublicDestinations();
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          price: item.price || 0,
        }));
        setDestinations(mapped);
      } catch (err: any) {
        setDestinationError(err?.data?.message ?? err?.message ?? 'Failed to load destinations.');
      } finally {
        setLoadingDestinations(false);
      }
    };

    // Load promotions
    const loadPromotions = async () => {
      try {
        const payload = await getPublicPromotions();
        setPromotions(payload);
      } catch (err) {
        // Silently fail if promotions can't be loaded
        console.warn('Failed to load promotions:', err);
      }
    };

    loadDestinations();
    loadTransports();
    loadPromotions();
  }, [loadTransports]);

  React.useEffect(() => {
    const handleFocus = () => loadTransports();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadTransports();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadTransports]);

  React.useEffect(() => {
    const destinationParam = parsePositiveInteger(searchParams.get('destinationId'));
    const transportParam = parsePositiveInteger(searchParams.get('transportId'));

    if (destinationParam && destinations.some((destination) => destination.id === destinationParam)) {
      setDestinationId(destinationParam);
    }

    if (transportParam && transports.some((transport) => transport.id === transportParam)) {
      setTransportId(transportParam);
    }
  }, [searchParams, destinations, transports]);

  React.useEffect(() => {
    if (destinations.length === 0) return;
    if (destinationId && destinations.some((destination) => destination.id === destinationId)) return;
    setDestinationId(destinations[0].id);
  }, [destinations, destinationId]);

  React.useEffect(() => {
    if (transports.length === 0) return;
    if (transportId && transports.some((transport) => transport.id === transportId)) return;
    setTransportId(transports[0].id);
  }, [transports, transportId]);

  const selectedDestination = React.useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? destinations[0],
    [destinationId, destinations],
  );
  const selectedTransport = React.useMemo(
    () => transports.find((transport) => transport.id === transportId) ?? transports[0],
    [transportId, transports],
  );

  const canSubmit =
    Boolean(selectedDestination) &&
    Boolean(selectedTransport) &&
    Boolean(travelDate) &&
    Number.isFinite(travelers) &&
    travelers >= 1;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError('Please log in to create a booking.');
      return;
    }

    if (!canSubmit) {
      setError('Please complete all fields.');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate the amount based on destination and promotion
      const destinationPromotion = getActivePromotionForDestination(selectedDestination?.id || 0);
      const baseDestinationPrice = selectedDestination?.price || 0;
      const destinationPrice = destinationPromotion 
        ? calculateDiscountedPrice(baseDestinationPrice, destinationPromotion)
        : baseDestinationPrice;

      // Calculate transport cost if not free
      const transportPromotion = getActivePromotionForTransport(selectedTransport?.id || 0);
      const transportPrice = selectedTransport?.is_free ? 0 : 
        (selectedTransport?.price_per_km ? selectedTransport.price_per_km * 50 : 0); // Assume 50km average
      const finalTransportPrice = transportPromotion && transportPrice > 0
        ? calculateDiscountedPrice(transportPrice, transportPromotion)
        : transportPrice;

      const totalAmount = destinationPrice + finalTransportPrice;

      const payload = {
        id: buildBookingId(),
        guest: user.name,
        service: selectedDestination?.name ?? 'Destination',
        route: selectedDestination?.location ?? '',
        pax: travelers,
        amount: totalAmount,
        status: 'pending',
        category: 'trip',
        customerEmail: user.email,
        customerPhone: user.phone ?? '',
        createdAt: new Date().toISOString(),
        destination_id: selectedDestination?.id,
        transport_id: selectedTransport?.id,
        travel_date: travelDate,
        vehicleType: selectedTransport?.name,
        // Promotion tracking
        promotion_id: destinationPromotion?.id || transportPromotion?.id || null,
      };

      const response = await bookingService.createBooking(payload);

      try {
        const createdBooking = (response as any)?.data ?? payload;
        sessionStorage.setItem('pending_customer_booking', JSON.stringify(createdBooking));
      } catch {
        // Ignore storage issues; the booking is still saved on the backend.
      }

      navigate('/customer/bookings');
    } catch (err: any) {
      setError(err?.data?.message ?? err?.message ?? 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-3xl mx-auto card p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Book a trip</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Please log in as a customer to create a booking.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/" className="btn-ghost px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              Back
            </Link>
            <Link to="/login" className="btn-primary px-4 py-2 rounded-lg">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-20 max-w-4xl mx-auto">
      <div className="card p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create booking</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Select a destination, transport, and travel details.
            </p>
          </div>
          <Link to="/customer/bookings" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            View my bookings
          </Link>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Destination</label>
            <select
              className="select-base w-full mt-2"
              value={destinationId ?? ''}
              onChange={(event) => setDestinationId(parsePositiveInteger(event.target.value))}
              disabled={loadingDestinations || destinations.length === 0}
            >
              {loadingDestinations && <option value="">Loading destinations...</option>}
              {!loadingDestinations && destinations.length === 0 && <option value="">No destinations available</option>}
              {destinations.map((hotel) => {
                const promotion = getActivePromotionForDestination(hotel.id);
                const discountedPrice = promotion ? calculateDiscountedPrice(hotel.price, promotion) : hotel.price;
                const hasDiscount = promotion && discountedPrice < hotel.price;
                
                return (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} — {hotel.location} — ${hasDiscount ? discountedPrice.toFixed(2) : hotel.price.toFixed(2)}
                    {hasDiscount && ` (was $${hotel.price.toFixed(2)})`}
                  </option>
                );
              })}
            </select>
            {destinationError && (
              <p className="mt-2 text-xs text-red-600">{destinationError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Transport</label>
            <select
              className="select-base w-full mt-2"
              value={transportId ?? ''}
              onChange={(event) => setTransportId(parsePositiveInteger(event.target.value))}
              disabled={loadingTransports || transports.length === 0}
            >
              {loadingTransports && <option value="">Loading transports...</option>}
              {!loadingTransports && transports.length === 0 && <option value="">No transports available</option>}
              {transports.map((v) => {
                const promotion = getActivePromotionForTransport(v.id);
                const basePrice = v.price_per_km || 0;
                const discountedPrice = promotion && basePrice ? calculateDiscountedPrice(basePrice, promotion) : basePrice;
                const hasDiscount = promotion && discountedPrice < basePrice;
                
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.type}
                    {v.is_free ? ' (Free)' : basePrice ? ` — $${hasDiscount ? discountedPrice.toFixed(2) : basePrice.toFixed(2)}/km${hasDiscount ? ` (was $${basePrice.toFixed(2)})` : ''}` : ''}
                  </option>
                );
              })}
            </select>
            {transportError && (
              <p className="mt-2 text-xs text-red-600">{transportError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Travel date</label>
              <input
                type="date"
                className="input-base mt-2"
                value={travelDate}
                min={todayDate}
                onChange={(event) => setTravelDate(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Travelers</label>
              <input
                type="number"
                min={1}
                className="input-base mt-2"
                value={travelers}
                onChange={(event) => {
                  const nextValue = parseInt(event.target.value, 10);
                  if (!Number.isFinite(nextValue)) {
                    setTravelers(1);
                    return;
                  }
                  setTravelers(Math.max(1, nextValue));
                }}
              />
            </div>
          </div>

          {/* Price Summary */}
          {(selectedDestination || selectedTransport) && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Price Summary</h3>
              
              {selectedDestination && (
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedDestination.name} (per night)
                    </span>
                    <div className="text-right">
                      {(() => {
                        const promotion = getActivePromotionForDestination(selectedDestination.id);
                        const discountedPrice = promotion ? calculateDiscountedPrice(selectedDestination.price, promotion) : selectedDestination.price;
                        const hasDiscount = promotion && discountedPrice < selectedDestination.price;
                        
                        return (
                          <>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through block">
                                ${selectedDestination.price.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-slate-900 dark:text-white">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            {promotion && (
                              <span className="text-xs text-emerald-600 ml-2">
                                {promotion.discount} OFF
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTransport && !selectedTransport.is_free && selectedTransport.price_per_km && (
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedTransport.name} (per km)
                    </span>
                    <div className="text-right">
                      {(() => {
                        const promotion = getActivePromotionForTransport(selectedTransport.id);
                        const discountedPrice = promotion ? calculateDiscountedPrice(selectedTransport.price_per_km, promotion) : selectedTransport.price_per_km;
                        const hasDiscount = promotion && discountedPrice < selectedTransport.price_per_km;
                        
                        return (
                          <>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through block">
                                ${selectedTransport.price_per_km.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-slate-900 dark:text-white">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            {promotion && (
                              <span className="text-xs text-emerald-600 ml-2">
                                {promotion.discount} OFF
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTransport?.is_free && (
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedTransport.name}
                    </span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              to="/"
              className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-11 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating...' : 'Create booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
