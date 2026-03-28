import React from 'react';
import { X, Download, Calendar, Hash, Phone, Mail, MapPin, User, CreditCard } from 'lucide-react';
import { formatRelativeTime } from '@/utils/utils';
import type { OwnerNotification } from '@/context/OwnerNotificationsContext';
import { ALL_HOTELS } from '@/data/hotels';
import { RENTAL_VEHICLES } from '@/data/rentals';

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

const formatValue = (value: any): string => {
  const s = String(value ?? '').trim();
  return s || '—';
};

const parseDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (value: any): string => {
  const d = parseDate(value);
  if (!d) return '—';
  try {
    return d.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toISOString();
  }
};

const ReceiptSection: React.FC<{ label: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  right,
  children,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between sm:block">
        <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">{label}</p>
        {right ? <div className="sm:hidden text-right">{right}</div> : null}
      </div>
      <div className="min-w-0">
        {children}
        {right ? <div className="hidden sm:block mt-1 text-right">{right}</div> : null}
      </div>
    </div>
  );
};

export const OwnerNotificationModal: React.FC<Props> = ({ notification, onClose, onOpenBooking }) => {
  const booking = notification?.data ?? null;
  const bookingId = String(notification?.bookingId ?? booking?.id ?? '').trim();

  if (!notification) return null;

  const image = getBookingImage(booking);
  const status = String(booking?.status ?? '').trim();
  const guestName = formatValue(booking?.guest);
  const guestEmail = String(booking?.customerEmail ?? '').trim();
  const guestPhone = String(booking?.customerPhone ?? '').trim();
  const serviceName = formatValue(booking?.service);
  const route = String(booking?.route ?? '').trim();
  const roomType = String(booking?.roomType ?? '').trim();
  const vehicleType = String(booking?.vehicleType ?? '').trim();
  const pax = booking?.pax != null ? String(booking.pax) : '';
  const paymentMethod = String(booking?.paymentMethod ?? '').trim();
  const amount = formatMoney(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount);
  const dateLine = `${String(booking?.date ?? '').trim()}${booking?.time ? ` ${booking.time}` : ''}`.trim();
  const stayLine =
    booking?.dateStart || booking?.dateEnd ? `Stay: ${formatValue(booking?.dateStart)} → ${formatValue(booking?.dateEnd)}` : '';
  const receiptDateTime = formatDateTime(booking?.createdAt ?? notification?.createdAt ?? booking?.date ?? null);
  const createdAtLabel = formatRelativeTime(notification?.createdAt);

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" onClick={onClose} />

      <div
        className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
        role="presentation"
      >
        <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()} role="presentation">
          {booking ? (
            <div className="rounded-[1.35rem] overflow-hidden border border-slate-200/80 bg-white dark:bg-slate-950 shadow-[0_22px_70px_rgba(2,6,23,0.35)]">
                {/* Top header */}
                <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Booking</p>
                      <h3 className="mt-1 text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                        {bookingId || notification.title}
                      </h3>
                      {status ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {status}
                        </div>
                      ) : null}
                      {createdAtLabel ? (
                        <p className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          {createdAtLabel}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // styling-only button; hook up to PDF/print later if desired
                          try {
                            window?.print?.();
                          } catch {
                            // ignore
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        type="button"
                      >
                        <Download size={14} />
                        Receipt
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        aria-label="Close receipt"
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipt card */}
                <div className="p-3 sm:p-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="bg-blue-600 px-4 py-3 text-white">
                      <p className="text-[10px] font-extrabold tracking-widest uppercase opacity-90">Official Receipt</p>
                      <p className="mt-1 text-lg font-black italic leading-none">Komrong Sanctuary</p>
                      <p className="mt-1 text-xs opacity-90">Owner Booking Receipt</p>
                    </div>

                    <div className="px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Booking ID</p>
                          <p className="mt-1 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Hash size={14} className="text-slate-400" />
                            <span className="truncate">{bookingId || '—'}</span>
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Date & Time</p>
                          <p className="mt-1 text-sm font-black text-slate-900 dark:text-white inline-flex items-center gap-2 justify-end">
                            <Calendar size={14} className="text-slate-400" />
                            {receiptDateTime}
                          </p>
                          {(booking?.dateStart || booking?.dateEnd) && (
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              Check-in / Check-out: {formatValue(booking?.dateStart)} → {formatValue(booking?.dateEnd)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {image ? (
                      <div className="px-4 pb-3">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                          <img src={image} alt="Booking" className="w-full h-[110px] sm:h-[130px] object-cover" />
                        </div>
                      </div>
                    ) : null}

                    <div className="px-4 pb-2 sm:px-5">
                      <ReceiptSection
                        label="Guest"
                        right={guestPhone ? <span className="text-xs text-slate-500 dark:text-slate-400">{guestPhone}</span> : undefined}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <User size={14} className="text-slate-400" />
                              <span className="truncate">{guestName}</span>
                            </p>
                            {guestEmail ? (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" />
                                <span className="truncate">{guestEmail}</span>
                              </p>
                            ) : null}
                          </div>
                          {guestPhone ? (
                            <p className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              <Phone size={14} className="text-slate-400" />
                              {guestPhone}
                            </p>
                          ) : null}
                        </div>
                      </ReceiptSection>

                      <ReceiptSection label="Service">
                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          {serviceName}
                        </p>
                        {route ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{route}</p> : null}
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          {roomType ? <p>{roomType}</p> : null}
                          {vehicleType ? <p>{vehicleType}</p> : null}
                        </div>
                      </ReceiptSection>

                      <ReceiptSection label="Payment" right={<span className="text-sm font-black text-slate-900 dark:text-white">{amount}</span>}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <CreditCard size={14} className="text-slate-400" />
                              Method: <span className="font-bold text-slate-700 dark:text-slate-200">{paymentMethod || '—'}</span>
                            </p>
                            {pax ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pax} pax</p> : null}
                            {dateLine ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Date: {dateLine}</p> : null}
                            {stayLine ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stayLine}</p> : null}
                          </div>
                        </div>
                      </ReceiptSection>

                      <ReceiptSection label="Status" right={<span className="text-sm font-black text-slate-900 dark:text-white">{status || '—'}</span>}>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ref: {formatValue(booking?.reference ?? booking?.ref ?? '')}</p>
                      </ReceiptSection>

                      {booking?.specialRequests ? (
                        <ReceiptSection label="Notes">
                          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{String(booking.specialRequests)}</p>
                        </ReceiptSection>
                      ) : null}
                    </div>

                    <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                        Thank you for using Komrong Explorer.
                      </p>
                    </div>
                  </div>

                  {bookingId && onOpenBooking ? (
                    <div className="mt-5 flex items-center justify-end">
                      <button
                        onClick={() => onOpenBooking(bookingId)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm"
                        type="button"
                      >
                        Open in Bookings
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
          ) : (
            <div className="rounded-[1.35rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl p-5 text-slate-200">
                <p className="text-sm font-semibold">No details attached to this notification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
