import React from 'react';
import { X, User, MapPin, CreditCard, Clock } from 'lucide-react';
import { cn, formatRelativeTime } from '@/src/utils/utils';
import type { OwnerNotification } from '@/src/context/OwnerNotificationsContext';
import { ALL_HOTELS } from '@/src/data/hotels';
import { RENTAL_VEHICLES } from '@/src/data/rentals';

type Props = {
  notification: OwnerNotification | null;
  onClose: () => void;
  onOpenBooking?: (bookingId: string) => void;
};

const getBookingImage = (booking: any): string | null => {
  if (!booking) return null;

  const explicit =
    booking?.image ||
    booking?.serviceImage ||
    booking?.hotelImage ||
    booking?.destinationImage ||
    booking?.rentalImage ||
    booking?.vehicleImage ||
    booking?.rental?.image;
  if (typeof explicit === 'string' && explicit.trim()) return explicit;

  const serviceName = String(booking?.service ?? '').trim();
  const routeName = String(booking?.route ?? '').trim();

  const hotel =
    ALL_HOTELS.find((h) => h.name === serviceName) ||
    ALL_HOTELS.find((h) => serviceName && h.name && serviceName.toLowerCase().includes(h.name.toLowerCase())) ||
    ALL_HOTELS.find((h) => routeName && h.location && routeName.toLowerCase().includes(h.location.toLowerCase()));

  if (hotel?.image) return hotel.image;

  const vehicleName = String(booking?.vehicleType ?? booking?.service ?? '').trim();
  const vehicle =
    RENTAL_VEHICLES.find((v) => v.name === vehicleName) ||
    RENTAL_VEHICLES.find((v) => vehicleName && v.name && vehicleName.toLowerCase().includes(v.name.toLowerCase()));

  if (vehicle?.image) return vehicle.image;

  return null;
};

const formatMoney = (value: any) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
};

export const OwnerNotificationModal: React.FC<Props> = ({ notification, onClose, onOpenBooking }) => {
  const booking = notification?.data ?? null;
  const bookingId = String(notification?.bookingId ?? booking?.id ?? '').trim();
  const createdAtLabel = formatRelativeTime(notification?.createdAt);

  if (!notification) return null;

  const image = getBookingImage(booking);
  const status = String(booking?.status ?? '').trim();

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" onClick={onClose} />

      <div className="absolute inset-x-0 top-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-[1.75rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl max-h-[84vh] flex flex-col">
          <div className="flex items-start justify-between p-5 border-b border-white/10">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-slate-400">Notification</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
                {notification.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300 line-clamp-2">{notification.message ?? ''}</p>
              {createdAtLabel && (
                <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase">{createdAtLabel}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-200 transition-colors"
              aria-label="Close notification"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {booking ? (
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {bookingId && (
                    <p className="text-sm font-extrabold text-white tracking-tight">
                      Booking <span className="text-slate-300">{bookingId}</span>
                    </p>
                  )}
                  {status && (
                    <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold">
                      {status}
                    </span>
                  )}
                </div>
                {bookingId && onOpenBooking && (
                  <button
                    onClick={() => onOpenBooking(bookingId)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs"
                    type="button"
                  >
                    Open in Bookings
                  </button>
                )}
              </div>

              {image ? (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                  <img src={image} alt="Booking" className="w-full h-[180px] object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 h-[120px] flex items-center justify-center text-slate-400 text-xs">
                  No preview image available
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User size={16} />
                    <p className="text-[11px] font-extrabold tracking-widest uppercase">Guest</p>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-white">{booking?.guest ?? '—'}</p>
                  {booking?.customerEmail && <p className="text-xs text-slate-300 mt-1">{booking.customerEmail}</p>}
                  {booking?.customerPhone && <p className="text-xs text-slate-300 mt-1">{booking.customerPhone}</p>}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={16} />
                    <p className="text-[11px] font-extrabold tracking-widest uppercase">Service</p>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-white">{booking?.service ?? '—'}</p>
                  {booking?.route && <p className="text-xs text-slate-300 mt-1">{booking.route}</p>}
                  {booking?.roomType && <p className="text-xs text-slate-400 mt-1">{booking.roomType}</p>}
                  {booking?.vehicleType && <p className="text-xs text-slate-400 mt-1">{booking.vehicleType}</p>}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={16} />
                    <p className="text-[11px] font-extrabold tracking-widest uppercase">Date & Time</p>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-white">
                    {booking?.date ?? booking?.createdAt ?? '—'}
                    {booking?.time ? `  ${booking.time}` : ''}
                  </p>
                  {(booking?.dateStart || booking?.dateEnd) && (
                    <p className="text-xs text-slate-300 mt-1">
                      Stay: {booking?.dateStart ?? '—'} to {booking?.dateEnd ?? '—'}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CreditCard size={16} />
                    <p className="text-[11px] font-extrabold tracking-widest uppercase">Payment</p>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-white">{formatMoney(booking?.amount)}</p>
                  {booking?.pax != null && <p className="text-xs text-slate-300 mt-1">{booking.pax} pax</p>}
                  {booking?.paymentMethod && (
                    <p className="text-xs text-slate-400 mt-1">Method: {booking.paymentMethod}</p>
                  )}
                </div>
              </div>

              {booking?.specialRequests && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-extrabold tracking-widest uppercase text-slate-300">Special Requests</p>
                  <p className="mt-2 text-xs text-slate-200 leading-relaxed line-clamp-3">{String(booking.specialRequests)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 overflow-y-auto">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
                <p className="text-sm font-semibold">No details attached to this notification.</p>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-sm",
                "bg-white/10 hover:bg-white/15 text-white transition-colors",
              )}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
