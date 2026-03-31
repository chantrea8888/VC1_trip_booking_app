import React from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '../../context/AuthContext';

const formatDate = (value: any) => {
  const d = value instanceof Date ? value : new Date(String(value ?? ''));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatMoney = (value: any) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
};

const getBookingDateLabel = (booking: any) => {
  if (booking?.category === 'hotel') {
    const start = formatDate(booking?.dateStart);
    const end = formatDate(booking?.dateEnd);
    if (start && end) return `${start} to ${end}`;
    return start || end || '';
  }
  const date = formatDate(booking?.date);
  const time = booking?.time ? String(booking.time) : '';
  return time ? `${date} ${time}` : date;
};

const normalizeBooking = (booking: any) => {
  if (!booking || typeof booking !== 'object') return null;

  return {
    ...booking,
    id: String(booking.id ?? booking.booking_id ?? booking.reference ?? `BK-${Date.now()}`),
  };
};

export const CustomerBookings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bookings, setBookings] = React.useState<any[]>([]);

  React.useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await bookingService.getMyBookings();
        const apiBookings = Array.isArray(response.data) ? response.data.map(normalizeBooking).filter(Boolean) : [];

        let pendingBooking: any = null;
        try {
          const stored = sessionStorage.getItem('pending_customer_booking');
          if (stored) {
            pendingBooking = normalizeBooking(JSON.parse(stored));
            sessionStorage.removeItem('pending_customer_booking');
          }
        } catch {
          pendingBooking = null;
        }

        const mergedBookings = pendingBooking
          ? [pendingBooking, ...apiBookings.filter((booking: any) => String(booking.id) !== String(pendingBooking.id))]
          : apiBookings;

        setBookings(mergedBookings);
      } catch (err: any) {
        setError(err?.data?.message ?? err?.message ?? 'Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-3xl mx-auto card p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My bookings</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Please log in to view your bookings.</p>
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
    <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-20 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My bookings</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage your travel reservations.</p>
        </div>
        <Link to="/customer/book" className="h-11 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
          New booking
        </Link>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
          {error}
        </div>
      )}

      <div className="mt-8 card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No bookings found.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first trip booking.</p>
            <div className="mt-6">
              <Link to="/customer/book" className="btn-primary px-5 py-3 rounded-xl inline-flex">
                Book a trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Travel date</th>
                  <th className="px-6 py-4">Travelers</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="table-row">
                    <td className="px-6 py-4 font-bold text-blue-600">{b.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{b.service}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{b.route}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{getBookingDateLabel(b)}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{b.pax}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatMoney(b.amount)}</td>
                    <td className="px-6 py-4 text-sm font-semibold capitalize">{String(b.status ?? '').toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

