import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { differenceInCalendarDays, format } from 'date-fns';
import { 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Users, 
  Edit2, 
  Download, 
  Share2, 
  Hotel, 
  Car, 
  Activity, 
  Plus, 
  MessageSquare,
  CreditCard,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Landmark,
  Wallet,
  ExternalLink,
  X,
  Save
} from 'lucide-react';
import { AVAILABLE_ACTIVITIES } from '../../data/activities';
import { bookingService } from '@/services/bookingService'; // Add this import
import { useAuth } from '../../context/AuthContext';
import { calculateTripPricing } from '@/utils/pricing';

const parseGuestCount = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value));
  }

  const match = String(value ?? '').match(/\d+/);
  return match ? Math.max(1, parseInt(match[0], 10) || 1) : 2;
};

const toDateInputValue = (value: unknown) => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';

  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

const toReadableDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '';
  }

  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
};

interface BookingHistoryProps {
  onPaymentClick: () => void;
  onHotelClick: () => void;
  onRentalClick: () => void;
  onGroupPlanningClick: () => void;
  selectedActivityIds: number[];
  setSelectedActivityIds: React.Dispatch<React.SetStateAction<number[]>>;
  tripData: any;
  setTripData: React.Dispatch<React.SetStateAction<any>>;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ 
  onPaymentClick,
  onHotelClick,
  onRentalClick,
  onGroupPlanningClick,
  selectedActivityIds,
  setSelectedActivityIds,
  tripData,
  setTripData
}) => {
  const availableActivities = AVAILABLE_ACTIVITIES;
  const { user, isAuthenticated } = useAuth();

  const getLocalDateInputValue = () => {
    const d = new Date();
    const tzOffsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
  };

  const getLocalTimeInputValue = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [editForm, setEditForm] = useState(() => ({
    title: tripData.title || '',
    startDate: toDateInputValue(tripData?.startDate ?? tripData?.dateStart),
    endDate: toDateInputValue(tripData?.endDate ?? tripData?.dateEnd),
    guestCount: parseGuestCount(tripData?.guests)
  }));

  const [paymentForm, setPaymentForm] = useState<{
    method: 'aba' | 'acleda';
    paymentDate: string;
    paymentTime: string;
    phone: string;
  }>(() => ({
    method: 'aba',
    paymentDate: getLocalDateInputValue(),
    paymentTime: getLocalTimeInputValue(),
    phone: '',
  }));

  // Add states for booking submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedActivities = availableActivities.filter((a) => selectedActivityIds.includes(a.id));
  const pricing = calculateTripPricing({ tripData, selectedActivities });
  const bookingStayLabel = React.useMemo(() => {
    const startValue = editForm.startDate || tripData?.startDate || tripData?.dateStart;
    const endValue = editForm.endDate || tripData?.endDate || tripData?.dateEnd;
    const start = startValue ? new Date(String(startValue)) : null;
    const end = endValue ? new Date(String(endValue)) : null;
    if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
    }
    return String(tripData?.dates || '');
  }, [editForm.endDate, editForm.startDate, tripData?.dateEnd, tripData?.dateStart, tripData?.dates, tripData?.endDate, tripData?.startDate]);

  useEffect(() => {
    if (isEditModalOpen) return;

    setEditForm({
      title: tripData.title || '',
      startDate: toDateInputValue(tripData?.startDate ?? tripData?.dateStart),
      endDate: toDateInputValue(tripData?.endDate ?? tripData?.dateEnd),
      guestCount: parseGuestCount(tripData?.guests)
    });
  }, [tripData, isEditModalOpen]);

  // Function to save booking to database
  const saveBookingToDatabase = async (opts?: { paymentMethod?: string; paymentDate?: string; paymentTime?: string; phone?: string }) => {
    try {
      setIsSubmitting(true);
      setBookingError(null);

      const toLocalIsoDate = (d: Date) => {
        const tzOffsetMs = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
      };

      const coerceDate = (value: any): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };

      const ensureYear = (value: string, year: number) => {
        if (/\b\d{4}\b/.test(value)) return value;
        return `${value.trim()}, ${year}`;
      };

      const tryParseDateString = (value: string) => {
        const cleaned = String(value ?? '').trim();
        if (!cleaned) return null;
        const parsed = new Date(cleaned);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      };

      // Prefer the actual selected dates from TripPlanner (startDate/endDate) if available.
      let checkIn = coerceDate(tripData?.startDate) ?? coerceDate(tripData?.dateStart);
      let checkOut = coerceDate(tripData?.endDate) ?? coerceDate(tripData?.dateEnd);

      // Fallback: parse from the human-readable range string.
      if ((!checkIn || !checkOut) && typeof tripData?.dates === 'string') {
        const parts = tripData.dates.split(' - ').map((s: string) => s.trim()).filter(Boolean);
        const startPart = parts[0] ?? '';
        const endPart = parts[1] ?? parts[0] ?? '';

        const currentYear = new Date().getFullYear();
        const endParsed =
          tryParseDateString(endPart) ?? tryParseDateString(ensureYear(endPart, currentYear));
        const yearForStart = endParsed?.getFullYear() ?? currentYear;
        const startParsed =
          tryParseDateString(startPart) ?? tryParseDateString(ensureYear(startPart, yearForStart));

        checkIn = checkIn ?? startParsed;
        checkOut = checkOut ?? endParsed ?? startParsed;
      }

      const checkInIso = checkIn ? toLocalIsoDate(checkIn) : null;
      const checkOutIso = checkOut ? toLocalIsoDate(checkOut) : null;
      if (!checkInIso || !checkOutIso) {
        throw new Error('Missing Check-in / Check-out dates');
      }

      // Create booking ID (reduce collision risk)
      const bookingId = `BK-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      
      // Prefer authenticated user info so "guest" matches the users table name
      const guestName = user?.name || tripData.guestName || 'Guest User';
      const guestEmail = user?.email || tripData.customerEmail || 'guest@example.com';
      const guestPhone = opts?.phone || user?.phone || tripData.customerPhone || '+855 12 345 678';
      
      // Prepare booking data for database
      const bookingPayload = {
        id: bookingId,
        guest: guestName,
        service: tripData.hotel.name,
        route: tripData.hotel.location,
        // For owner preview (image in details modal)
        image: tripData.hotel.image,
        serviceImage: tripData.hotel.image,
        hotelImage: tripData.hotel.image,
        dateStart: checkInIso,
        dateEnd: checkOutIso,
        date: opts?.paymentDate ?? null,
        time: opts?.paymentTime ?? null,
        pax: parseInt(tripData.guests) || 2,
        amount: pricing.total,
        status: 'pending',
        category: 'hotel',
        roomType: tripData.hotel.roomType,
        vehicleType: tripData.rental.isBooked ? tripData.rental.name : null,
        customerEmail: guestEmail,
        customerPhone: guestPhone,
        specialRequests: '',
        paymentMethod: opts?.paymentMethod ?? 'credit_card',
        createdAt: new Date().toISOString(),
        // Additional info for reference
        rental: tripData.rental.isBooked ? {
          name: tripData.rental.name,
          price: pricing.rentalTotal,
          pickup: tripData.rental.pickup,
          image: tripData.rental.image
        } : null,
        rentalImage: tripData.rental.isBooked ? tripData.rental.image : null,
        activities: selectedActivities.map(a => ({
          id: a.id,
          name: a.name,
          price: a.price,
          guests: a.guests,
          image: a.image,
          date: a.date,
        })),
        reference: tripData.reference,
        totalAmount: pricing.total,
        original_amount: pricing.originalTotal,
        discounted_amount: pricing.discountTotal,
        promotion_id: (() => {
          const hotelPromoId = tripData?.hotel?.promotion?.id ?? null;
          const rentalPromoId = tripData?.rental?.promotion?.id ?? null;
          return hotelPromoId && rentalPromoId ? null : hotelPromoId || rentalPromoId || null;
        })(),
        destination_id: tripData?.hotel?.destination_id ?? tripData?.hotel?.destinationId ?? null,
        transport_id: tripData?.rental?.transport_id ?? tripData?.rental?.transportId ?? null,
        nights: tripData.hotel.nights,
        guests: tripData.guests
      };

      console.log('📤 Sending booking to database:', bookingPayload);

      // Send to backend
      const response = await bookingService.createBooking(bookingPayload);
      
      console.log('✅ Booking saved successfully:', response);
      setBookingSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to save booking. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentDetails = (method: 'aba' | 'acleda') => {
    setBookingError(null);
    setPaymentForm({
      method,
      paymentDate: getLocalDateInputValue(),
      paymentTime: getLocalTimeInputValue(),
      phone: user?.phone || tripData.customerPhone || '',
    });
    setIsPaymentModalOpen(true);
  };

  // Handle payment and save (after collecting details)
  const handlePaymentAndSave = async (method: 'aba' | 'acleda', paymentDate: string, paymentTime: string, phone: string) => {
    if (isSubmitting) return;
    if (!isAuthenticated) {
      setBookingError('Please log in to save your booking to the database.');
      return;
    }
    const saved = await saveBookingToDatabase({ paymentMethod: method, paymentDate, paymentTime, phone });
    if (saved) {
      setIsPaymentModalOpen(false);
      // Proceed to payment after successful save
      onPaymentClick();
    }
  };

  const handleConfirmPaymentDetails = async () => {
    const phone = paymentForm.phone.trim();
    if (!phone) {
      setBookingError('Please enter your phone number to continue.');
      return;
    }

    const paymentDate = paymentForm.paymentDate || getLocalDateInputValue();
    const paymentTime = paymentForm.paymentTime || getLocalTimeInputValue();

    // For ABA we keep date/time internally but don't ask the user for it.
    if (paymentForm.method !== 'aba') {
      if (!paymentDate) {
        setBookingError('Please select a payment date to continue.');
        return;
      }
      if (!paymentTime) {
        setBookingError('Please select a payment time to continue.');
        return;
      }
    }

    await handlePaymentAndSave(paymentForm.method, paymentDate, paymentTime, phone);
  };

  const toggleRentalBooking = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTripData((prev: any) => ({
      ...prev,
      rental: {
        ...prev.rental,
        isBooked: !prev.rental.isBooked
      }
    }));
  };

  const toggleActivity = (id: number) => {
    setSelectedActivityIds((prev) => {
      return prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id];
    });
  };

  const handleSaveEdit = () => {
    const startDate = editForm.startDate || toDateInputValue(tripData?.startDate ?? tripData?.dateStart);
    const endDate = editForm.endDate || toDateInputValue(tripData?.endDate ?? tripData?.dateEnd);

    if (!startDate || !endDate) {
      setBookingError('Please choose both check-in and check-out dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setBookingError('Please choose valid check-in and check-out dates.');
      return;
    }
    if (end < start) {
      setBookingError('Check-out must be the same day or after check-in.');
      return;
    }

    const nights = Math.max(1, differenceInCalendarDays(end, start) || 0);
    const guestsLabel = `${editForm.guestCount} Guest${editForm.guestCount === 1 ? '' : 's'}`;

    setTripData(prev => ({
      ...prev,
      title: editForm.title.trim() || prev.title,
      startDate,
      endDate,
      dates: toReadableDateRange(startDate, endDate),
      guests: guestsLabel,
      hotel: {
        ...prev.hotel,
        guests: guestsLabel,
        nights,
        price: (prev.hotel?.dailyPrice || 0) * nights
      },
      rental: {
        ...prev.rental,
        days: nights,
        price: (prev.rental?.dailyPrice || 0) * nights
      }
    }));
    setIsEditModalOpen(false);
  };

  const handleDownload = async () => {
    try {
      // Use a literal dynamic import so Vite can bundle it (variable imports won't be resolved).
      const jsPDFMod = await import('jspdf');
      const jsPDF =
        (jsPDFMod as any)?.jsPDF ||
        (jsPDFMod as any)?.default?.jsPDF ||
        (jsPDFMod as any)?.default ||
        (jsPDFMod as any);
      if (typeof jsPDF !== 'function') throw new Error('PDF library not available');

      const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Trip Summary", margin, y);
    y += 12;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`${tripData.title} ${tripData.emoji}`, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Reference: ${tripData.reference}`, margin, y);
    y += 15;

    // Details Section
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Dates: ${bookingStayLabel}`, margin, y);
    y += 7;
    doc.text(`Guests: ${tripData.guests}`, margin, y);
    y += 15;

    // Hotel Section
    doc.setFontSize(14);
    doc.setTextColor(234, 88, 12); // orange-600
    doc.text("Hotel Accommodation", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Name: ${tripData.hotel.name}`, margin, y);
    y += 6;
    doc.text(`Location: ${tripData.hotel.location}`, margin, y);
    y += 6;
    doc.text(`Room: ${tripData.hotel.roomType}`, margin, y);
    y += 6;
    doc.text(`Price: $${tripData.hotel.price.toFixed(2)}`, margin, y);
    y += 15;

    // Rental Section
    if (tripData.rental.isBooked) {
      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12);
      doc.text("Rental Vehicle", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Vehicle: ${tripData.rental.name}`, margin, y);
      y += 6;
      doc.text(`Pickup: ${tripData.rental.pickup}`, margin, y);
      y += 6;
      doc.text(`Features: ${tripData.rental.features}`, margin, y);
      y += 6;
      doc.text(`Price: $${tripData.rental.price.toFixed(2)}`, margin, y);
      y += 15;
    } else {
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text("Rental Vehicle: Not Selected", margin, y);
      y += 15;
    }

    // Activities Section
    if (selectedActivities.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text("Activities", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      selectedActivities.forEach(a => {
        doc.text(`- ${a.name} ($${a.price.toFixed(2)})`, margin, y);
        y += 6;
      });
      y += 10;
    }

    // Financial Summary
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Financial Summary", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`Subtotal: $${pricing.subtotal.toFixed(2)}`, margin, y);
    y += 6;
    doc.text(`Taxes & Fees: $${pricing.taxes.toFixed(2)}`, margin, y);
    y += 6;
    doc.text(`Service Fee: $${pricing.serviceFee.toFixed(2)}`, margin, y);
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text(`TOTAL: $${pricing.total.toFixed(2)}`, margin, y);
    y += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for booking with Cambodia Travel!", margin, y);
    
    doc.save(`trip-summary-${tripData.reference.replace('#', '')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback: copy trip summary to clipboard
      const shareText = `Trip Summary - ${tripData.title}
Dates: ${bookingStayLabel}
Guests: ${tripData.guests}
Reference: ${tripData.reference}
Hotel: ${tripData.hotel.name} - $${tripData.hotel.price.toFixed(2)}
${tripData.rental.isBooked ? `Rental: ${tripData.rental.name} - $${tripData.rental.price.toFixed(2)}` : 'Rental: Not Selected'}
Activities: ${selectedActivities.map(a => `${a.name} ($${a.price.toFixed(2)})`).join(', ')}
TOTAL: $${pricing.total.toFixed(2)}`;
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleShare = async () => {
    const shareText = `Check out my trip to ${tripData.title}! 
Dates: ${bookingStayLabel}
Guests: ${tripData.guests}
Reference: ${tripData.reference}
Booked via Cambodia Travel`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trip to ${tripData.title}`,
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(shareText + "\n" + window.location.origin);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const supportContent = {
    help: {
      title: 'Help Center',
      subtitle: 'We are here to make your trip smooth and stress-free.',
      intro:
        'Welcome to our Help Center! You can contact us via email or live chat. Here you’ll find answers to the most common questions and tips to get the best experience.',
      details: [
        'Company: Cambodia Travel (local-first travel platform)',
        'Email: support@cambodiatravel.com',
        'Live chat: 24/7 in-app concierge',
        'Typical response time: under 15 minutes'
      ],
      faqsTitle: 'Common FAQs',
      faqs: [
        'How do I change my hotel or transport booking?',
        'Can I add or remove guests after booking?',
        'Where can I download my receipt?',
        'How do refunds work if plans change?'
      ],
      tipsTitle: 'Helpful tips',
      tips: [
        'Double-check dates and guest counts before paying.',
        'Download your receipt for quick hotel check-in.',
        'Share your itinerary with fellow travelers.'
      ]
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'A quick summary of the rules that keep everyone safe.',
      intro:
        'By booking with us, you agree to use the service responsibly and provide accurate information. These terms protect both travelers and partners.',
      highlights: [
        'Provide accurate traveler details and payment information.',
        'No resale or unauthorized commercial use of bookings.',
        'Respect property rules and local regulations.',
        'Changes and cancellations follow the stated policy for each booking.'
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Clear, simple information about how we handle your data.',
      intro:
        'We collect only the data needed to manage bookings, provide support, and improve your experience. We never sell your personal information.',
      controlsTitle: 'Your controls',
      controls: [
        'Request a copy of your data.',
        'Update communication preferences.',
        'Ask for account deletion or anonymization.'
      ]
    },
    refund: {
      title: 'Refund Policy',
      subtitle: 'Refund eligibility and timelines at a glance.',
      intro:
        'Refunds depend on the cancellation window and the provider policy. We will always show the refundable amount before you confirm a cancellation.',
      details: [
        'Eligibility: within the provider’s cancellation window.',
        'Timeline: 5–10 business days after approval.',
        'Process: submit a request and we handle the provider follow-up.'
      ]
    }
  } as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Success Message */}
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">Booking confirmed! It will appear in the Owner dashboard.</span>
          </motion.div>
        )}

        {/* Error Message */}
        {bookingError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6"
          >
            {bookingError}
          </motion.div>
        )}
        
        {/* Review Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-16 md:p-24 mb-12 text-center min-h-[450px] flex items-center justify-center group"
        >
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&q=80&w=2000" 
              alt="Cambodia Banner" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-900/40 backdrop-blur-[2px]" />
          </div>
          
          <div className="relative z-10 w-full">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border border-white/30">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">Review Your Trip Details</h1>
            <p className="text-white/90 max-w-2xl mx-auto mb-10 text-xl leading-relaxed">
              Please double-check your accommodation, transport, and activities. Once you're ready, proceed to secure payment.
            </p>
            <div className="inline-flex items-center px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white tracking-[0.2em] uppercase">
              Reference {tripData.reference}
            </div>
          </div>
        </motion.div>

        {/* Trip Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Trips</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600">{tripData.title}</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {tripData.title} {tripData.emoji}
            </h2>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Calendar className="w-4 h-4" />
                <span>{bookingStayLabel || 'Check-in / Check-out not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Users className="w-4 h-4" />
                <span>{tripData.guests}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onGroupPlanningClick}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Users className="w-5 h-5" /> Group Planning
            </button>
            <button 
              onClick={handleShare}
              className="relative flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.div
                    key="copied"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Copied!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Trip</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hotel Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <Hotel className="w-5 h-5" />
                  <h3>Hotel</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md">
                  {tripData.hotel.status}
                </span>
              </div>
              <div 
                onClick={() => onHotelClick()}
                className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                  <img src={tripData.hotel.image} alt={tripData.hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{tripData.hotel.name}</h4>
                      <p className="text-sm text-slate-400">{tripData.hotel.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Total for {tripData.hotel.nights} nights</p>
                      <p className="text-2xl font-bold text-blue-600">${tripData.hotel.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{tripData.hotel.roomType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guest</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{tripData.hotel.guests}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onHotelClick()}
                    className="mt-6 text-blue-600 font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <RefreshCw className="w-4 h-4" /> Change Hotel
                  </button>
                </div>
              </div>
            </section>

            {/* Rental Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-600 font-bold">
                  <Car className="w-5 h-5" />
                  <h3>Rental</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleRentalBooking}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      tripData.rental.isBooked 
                        ? "bg-red-50 text-red-600 border border-red-100" 
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}
                  >
                    {tripData.rental.isBooked ? 'Cancel Booking' : 'Book Now'}
                  </button>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    tripData.rental.isBooked ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {tripData.rental.isBooked ? tripData.rental.status : 'Not Selected'}
                  </span>
                </div>
              </div>
              <div 
                onClick={onRentalClick}
                className={`bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border shadow-sm flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-all group ${
                  tripData.rental.isBooked ? "border-slate-100 dark:border-slate-800" : "border-dashed border-slate-300 dark:border-slate-700 opacity-60"
                }`}
              >
                <div className="md:w-64 h-48 md:h-auto overflow-hidden grayscale-[0.5] group-hover:grayscale-0 transition-all">
                  <img src={tripData.rental.image} alt={tripData.rental.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`text-xl font-bold mb-1 ${tripData.rental.isBooked ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {tripData.rental.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>Pickup: {tripData.rental.pickup}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Total for {tripData.rental.days} days</p>
                      <p className={`text-2xl font-bold ${tripData.rental.isBooked ? "text-blue-600" : "text-slate-300"}`}>
                        ${tripData.rental.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-4">
                    <Users className="w-4 h-4" />
                    <span>{tripData.rental.features}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <button 
                      onClick={onRentalClick}
                      className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <RefreshCw className="w-4 h-4" /> Change Vehicle
                    </button>
                    {!tripData.rental.isBooked && (
                      <button 
                        onClick={toggleRentalBooking}
                        className="text-emerald-600 font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <Plus className="w-4 h-4" /> Add to Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Activities Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Activity className="w-5 h-5" />
                  <h3>Activities</h3>
                </div>
              </div>
              <div className="space-y-4">
                {availableActivities.map((activity) => {
                  const isSelected = selectedActivityIds.includes(activity.id);
                  return (
                    <div 
                      key={activity.id} 
                      className={`bg-white dark:bg-slate-900 rounded-[24px] p-4 border transition-all flex items-center gap-4 ${
                        isSelected 
                          ? "border-blue-500 shadow-md ring-1 ring-blue-500/20" 
                          : "border-slate-100 dark:border-slate-800 shadow-sm opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{activity.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{activity.date}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">${activity.price.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400">x {activity.guests} Guests</p>
                        </div>
                        <button 
                          onClick={() => toggleActivity(activity.id)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                            isSelected 
                              ? "bg-red-50 text-red-600 hover:bg-red-100" 
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isSelected ? 'Remove' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Financial Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Financial Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Hotel</span>
                  <span className="font-bold text-slate-900 dark:text-white">${pricing.hotelTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rental</span>
                  <span className="font-bold text-slate-900 dark:text-white">${pricing.rentalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Activities ({selectedActivityIds.length} selected)</span>
                  <span className="font-bold text-slate-900 dark:text-white">${pricing.activitiesTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Taxes & Fees</span>
                  <span className="font-bold text-slate-900 dark:text-white">${pricing.taxes.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-bold text-slate-900 dark:text-white">${pricing.serviceFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  ${pricing.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <button 
                  onClick={() => openPaymentDetails('aba')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? ( 
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Landmark className="w-5 h-5" /> Pay with ABA
                    </>
                  )}
                </button>

                <button 
                  onClick={() => openPaymentDetails('acleda')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-800 text-white rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Pay with ACLEDA
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center">
                <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">Scan to pay with ABA or ACLEDA</p>
                <p className="text-[10px] text-slate-400 mb-4">Scan to pay with your preferred banking app</p>
                <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                  <QrCode className="w-24 h-24 text-slate-900 dark:text-white" />
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Secure Encryption
                </div>
              </div>

              <button 
                onClick={handleDownload}
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-5 h-5" /> Download Receipt
              </button>

              <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed">
                By confirming, you agree to our <span className="text-blue-600 cursor-pointer">Terms</span>. Flexible cancellation up to 48h before arrival.
              </p>
            </div>

            {/* Help Card */}
            <div className="bg-slate-900 dark:bg-white rounded-[32px] p-8 text-white dark:text-slate-900 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold">Need help?</h4>
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                  Our 24/7 Cambodia concierge is ready to assist with your specific travel needs.
                </p>
                <button className="w-full py-3 bg-white/10 dark:bg-slate-900/10 rounded-xl font-bold text-sm hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors">
                  Chat with Agent
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>

          </div>
        </div>

      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Trip Details</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trip Title</label>
                    <input 
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Check-in</label>
                      <input 
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Check-out</label>
                      <input 
                        type="date"
                        value={editForm.endDate}
                        min={editForm.startDate || undefined}
                        onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Guests</label>
                    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {editForm.guestCount} {editForm.guestCount === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, guestCount: Math.max(1, prev.guestCount - 1) }))}
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40"
                          disabled={editForm.guestCount <= 1}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, guestCount: prev.guestCount + 1 }))}
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Components</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            setIsEditModalOpen(false);
                            onHotelClick();
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                        >
                          <Hotel className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Change Hotel</span>
                        </button>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              setIsEditModalOpen(false);
                              onRentalClick();
                            }}
                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                          >
                            <Car className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Change</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              toggleRentalBooking(e);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl transition-all ${
                              tripData.rental.isBooked 
                                ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" 
                                : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {tripData.rental.isBooked ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {tripData.rental.isBooked ? 'Remove' : 'Add'}
                            </span>
                          </button>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Details</h3>
                  <button 
                    onClick={() => !isSubmitting && setIsPaymentModalOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label="Close"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
                    {bookingError}
                  </div>
                )}

                <div className="space-y-6">
                  {paymentForm.method !== 'aba' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Date</label>
                        <input 
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Time</label>
                        <input 
                          type="time"
                          value={paymentForm.paymentTime}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentTime: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      placeholder="+855 12 345 678"
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-slate-400">Used for payment confirmation and booking contact.</p>
                  </div>

                  <div className="pt-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</p>
                      <p className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">
                        {paymentForm.method === 'aba' ? 'ABA' : 'ACLEDA'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setIsPaymentModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmPaymentDetails}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" /> Continue to Pay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingHistory
