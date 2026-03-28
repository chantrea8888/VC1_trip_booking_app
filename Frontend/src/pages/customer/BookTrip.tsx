import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { ALL_HOTELS } from '../../data/hotels';
import { RENTAL_VEHICLES } from '../../data/rentals';
=======
>>>>>>> social-account
import { bookingService } from '@/services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { getPublicDestinations } from '../../services/destinationService';

const buildBookingId = () => `BK-${Date.now()}`;

export const BookTrip: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [destinationId, setDestinationId] = React.useState<number | null>(null);
  const [destinations, setDestinations] = React.useState<Array<{
    id: number;
    name: string;
    location: string;
  }>>([]);
  const [destinationError, setDestinationError] = React.useState<string | null>(null);
  const [loadingDestinations, setLoadingDestinations] = React.useState(false);
  const [transportId, setTransportId] = React.useState<number | null>(null);
  const [transports, setTransports] = React.useState<Array<{
    id: number;
    name: string;
    type: string;
    is_free: boolean;
  }>>([]);
  const [transportError, setTransportError] = React.useState<string | null>(null);
  const [loadingTransports, setLoadingTransports] = React.useState(false);
  const [travelDate, setTravelDate] = React.useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [travelers, setTravelers] = React.useState<number>(2);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadTransports = React.useCallback(async () => {
    setLoadingTransports(true);
    setTransportError(null);

    try {
      const response = await apiRequest('/transports') as { data?: any[] };
      const mapped = (response?.data ?? [])
        .map((item: any) => {
          const rawType = String(item?.transport_type ?? 'Car Rental');
          const type = rawType === 'Shuttle' ? 'Train' : rawType === 'Other' ? 'Car Rental' : rawType;
          const rawId = item?.transport_id ?? item?.id;
          const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
          return {
            id: Number.isFinite(id) ? id : 0,
            name: String(item?.service_name ?? '').trim(),
            type: String(type),
            is_free: Boolean(item?.is_free ?? item?.isFree ?? false),
          };
        })
        .filter((item: any) => item.id && item.name);

      setTransports(mapped);
    } catch (err: any) {
      setTransportError(err?.data?.message ?? err?.message ?? 'Failed to load transports.');
    } finally {
      setLoadingTransports(false);
    }
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
        }));
        setDestinations(mapped);
      } catch (err: any) {
        setDestinationError(err?.data?.message ?? err?.message ?? 'Failed to load destinations.');
      } finally {
        setLoadingDestinations(false);
      }
    };

    loadDestinations();
    loadTransports();
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
    const destinationParam = searchParams.get('destinationId');
    const transportParam = searchParams.get('transportId');

    const nextDestinationId = destinationParam ? parseInt(destinationParam, 10) : NaN;
    const nextTransportId = transportParam ? parseInt(transportParam, 10) : NaN;

    if (Number.isFinite(nextDestinationId) && destinations.some((h) => h.id === nextDestinationId)) {
      setDestinationId(nextDestinationId);
    }

    if (Number.isFinite(nextTransportId) && transports.some((v) => v.id === nextTransportId)) {
      setTransportId(nextTransportId);
    }
  }, [searchParams, destinations, transports]);

  React.useEffect(() => {
    if (destinations.length === 0) return;
    if (destinationId && destinations.some((d) => d.id === destinationId)) return;
    setDestinationId(destinations[0].id);
  }, [destinations, destinationId]);

  React.useEffect(() => {
    if (transports.length === 0) return;
    if (transportId && transports.some((t) => t.id === transportId)) return;
    setTransportId(transports[0].id);
  }, [transports, transportId]);

  const selectedDestination = React.useMemo(
    () => destinations.find((h) => h.id === destinationId) ?? destinations[0],
    [destinationId, destinations],
  );
  const selectedTransport = React.useMemo(
    () => transports.find((v) => v.id === transportId) ?? transports[0],
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

      const payload = {
        id: buildBookingId(),
        guest: user.name,
        service: selectedDestination?.name ?? 'Destination',
        route: selectedDestination?.location ?? '',
        pax: travelers,
        amount: 0,
        status: 'pending',
        category: 'trip',
        customerEmail: user.email,
        customerPhone: user.phone ?? '',
        createdAt: new Date().toISOString(),
        destination_id: selectedDestination?.id,
        transport_id: selectedTransport?.id,
        travel_date: travelDate,
        vehicleType: selectedTransport?.name,
      };

      await bookingService.createBooking(payload);
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
              onChange={(e) => setDestinationId(parseInt(e.target.value, 10))}
              disabled={loadingDestinations || destinations.length === 0}
            >
              {loadingDestinations && <option value="">Loading destinations...</option>}
              {!loadingDestinations && destinations.length === 0 && <option value="">No destinations available</option>}
              {destinations.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} — {hotel.location}
                </option>
              ))}
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
              onChange={(e) => setTransportId(parseInt(e.target.value, 10))}
              disabled={loadingTransports || transports.length === 0}
            >
              {loadingTransports && <option value="">Loading transports...</option>}
              {!loadingTransports && transports.length === 0 && <option value="">No transports available</option>}
              {transports.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.type}{v.is_free ? ' (Free)' : ''}
                </option>
              ))}
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
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Travelers</label>
              <input
                type="number"
                min={1}
                className="input-base mt-2"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

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
              {submitting ? 'Creating…' : 'Create booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
