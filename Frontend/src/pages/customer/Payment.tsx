import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  ChevronRight, 
  Calendar, 
  Users, 
  ArrowRight,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { AVAILABLE_ACTIVITIES } from '../../data/activities';

interface PaymentProps {
  tripData?: any;
  onBackToHome?: () => void;
  selectedActivityIds?: number[];
  onOpenMessages?: () => void;
}

const ProcessingStep: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const [status, setStatus] = useState<'waiting' | 'loading' | 'done'>('waiting');

  React.useEffect(() => {
    const timer1 = setTimeout(() => setStatus('loading'), delay);
    const timer2 = setTimeout(() => setStatus('done'), delay + 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [delay]);

  return (
    <div className="flex items-center gap-3 py-1">
      {status === 'done' ? (
        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
          <CheckCircle2 className="w-3 h-3" />
        </div>
      ) : status === 'loading' ? (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-800 rounded-full" />
      )}
      <span className={`text-sm font-medium ${status === 'done' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
};

export const Payment: React.FC<PaymentProps> = ({ tripData, onBackToHome, selectedActivityIds = [] }) => {
  // Keep legacy payment-method UI available in-code, but hidden by default.
  const SHOW_LEGACY_PAYMENT_METHODS = false;

  const [selectedMethod, setSelectedMethod] = useState<'aba' | 'acleda' | 'wing' | 'amret'>('aba');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionAt, setTransactionAt] = useState<Date | null>(null);

  const formatTransactionDateTime = (value: Date) => {
    // Use a single, consistent formatter so Date & Time always reflects the booking moment.
    return value.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const coerceDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatStayRange = (start: Date, end: Date) => {
    const fmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const startLabel = start.toLocaleDateString('en-GB', fmt);
    const endLabel = end.toLocaleDateString('en-GB', fmt);
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  };

  const handleDone = () => {
    setShowReceipt(false);
    setPaymentStatus('idle');
    setTransactionAt(null);
    onBackToHome?.();
  };

  const handlePayment = () => {
    setShowReceipt(false);
    setPaymentStatus('processing');
    setTransactionAt((prev) => prev ?? new Date());
    setTimeout(() => {
      setPaymentStatus('success');
    }, 6000);
  };

  const handlePrint = async () => {
    if (!receiptRef.current) return;
    
    try {
      const loadLib = async (name: string) => {
        const importer = Function('n', 'return import(n)') as (n: string) => Promise<any>;
        return importer(name);
      };

      const [html2canvasMod, jsPDFMod] = await Promise.all([
        loadLib('html2canvas'),
        loadLib('jspdf'),
      ]);

      const html2canvas = html2canvasMod?.default;
      const jsPDF = jsPDFMod?.default;
      if (!html2canvas || !jsPDF) throw new Error('Missing PDF dependencies');

      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-${transactionId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to window.print() if jspdf fails
      window.print();
    }
  };

  const receiptRef = useRef<HTMLDivElement>(null);
  const transactionId = useRef("KMR-" + Math.random().toString(36).substring(2, 10).toUpperCase()).current;
  const transactionDate = transactionAt ? formatTransactionDateTime(transactionAt) : '';

  const selectedActivities = AVAILABLE_ACTIVITIES.filter(a => selectedActivityIds.includes(a.id));
  const activitiesTotal = selectedActivities.reduce((sum, a) => sum + (a.price * a.guests), 0);
  const hotelPrice = tripData?.hotel?.price || 0;
  const rentalPrice = tripData?.rental?.isBooked ? (tripData?.rental?.price || 0) : 0;
  const subtotal = hotelPrice + rentalPrice + activitiesTotal;
  const taxes = subtotal * 0.05;
  const serviceFee = 5.00;
  const total = subtotal + taxes + serviceFee;

  const checkIn = coerceDate(tripData?.startDate) ?? coerceDate(tripData?.dateStart);
  const checkOut = coerceDate(tripData?.endDate) ?? coerceDate(tripData?.dateEnd);
  const stayDatesLabel =
    checkIn && checkOut ? formatStayRange(checkIn, checkOut) : String(tripData?.dates || 'Check-in / Check-out not set');

  const bookingData = {
    title: tripData?.title || tripData?.destination?.name || tripData?.hotel?.name || 'Your trip',
    location: tripData?.hotel?.location || tripData?.destination?.name || '',
    dates: stayDatesLabel,
    details: `${tripData?.guests || '2 Adults'} • ${tripData?.hotel?.roomType || 'Deluxe Room'}`,
    image: tripData?.hotel?.image || tripData?.destination?.image || '',
    pricing: {
      subtotal,
      taxes,
      serviceFee,
      total
    }
  };

  const galleryImages = Array.from(
    new Set(
      [
        bookingData.image,
        tripData?.rental?.isBooked ? tripData?.rental?.image : null,
        ...selectedActivities.map((a) => a.image),
      ].filter(Boolean) as string[],
    ),
  );

  const LegacyPaymentMethods = () => {
    if (!SHOW_LEGACY_PAYMENT_METHODS) return null;

    return (
      <div className="lg:col-span-8">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Complete your booking</h1>
            <p className="text-slate-500 dark:text-slate-400">Select your preferred payment method from trusted Cambodian banks.</p>
          </header>

          <div className="mb-12">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Local Bank Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ABA Bank */}
              <button
                onClick={() => setSelectedMethod('aba')}
                className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                  selectedMethod === 'aba'
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#005A8C] rounded-xl flex items-center justify-center text-white font-bold text-xs">
                    ABA
                  </div>
                  {selectedMethod === 'aba' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">ABA Bank</h4>
                <p className="text-[10px] text-slate-400">Pay with KHQR or ABA PayWay</p>
              </button>

              {/* ACLEDA Bank */}
              <button
                onClick={() => setSelectedMethod('acleda')}
                className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                  selectedMethod === 'acleda'
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center overflow-hidden">
                    <img src="https://www.acledabank.com.kh/kh/assets/layout/images/logo.png" alt="ACLEDA" className="w-8 h-8 object-contain" />
                  </div>
                  {selectedMethod === 'acleda' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">ACLEDA Bank</h4>
                <p className="text-[10px] text-slate-400">ACLEDA Mobile / ToanChet</p>
              </button>

              {/* Wing Bank */}
              <button
                onClick={() => setSelectedMethod('wing')}
                className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                  selectedMethod === 'wing'
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#92C83E] rounded-xl flex items-center justify-center text-white font-bold text-[10px]">
                    WING
                  </div>
                  {selectedMethod === 'wing' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Wing Bank</h4>
                <p className="text-[10px] text-slate-400">Wing Money & App Payments</p>
              </button>

              {/* Amret MFI */}
              <button
                onClick={() => setSelectedMethod('amret')}
                className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                  selectedMethod === 'amret'
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="w-8 h-8 bg-[#0072BC] rounded-full" />
                  </div>
                  {selectedMethod === 'amret' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Amret MFI</h4>
                <p className="text-[10px] text-slate-400">Amret Mobile Banking</p>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-6 bg-slate-100 dark:bg-slate-800 rounded border border-white dark:border-slate-900 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2" />
                </div>
                <div className="w-10 h-6 bg-slate-100 dark:bg-slate-800 rounded border border-white dark:border-slate-900 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 max-w-[180px]">
                International cards also accepted via PayWay gateway.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0072BC] rounded-xl flex items-center justify-center">
                <img src="https://www.amret.com.kh/wp-content/uploads/2021/05/Amret-Logo-White.png" alt="Amret" className="w-8 object-contain" />
              </div>
              <button
                onClick={handlePayment}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none group"
              >
                {selectedMethod === 'aba' ? 'Scan QR Code' : 'Pay Now'} ${bookingData.pricing.total.toFixed(2)}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-slate-300 dark:text-slate-700">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Secure Payments Via</span>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-4 h-4" />
              <Lock className="w-4 h-4" />
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed max-w-2xl mx-auto">
          By clicking "Pay Now", you agree to Komrong's <span className="text-blue-600 cursor-pointer font-medium">Terms of Service</span> and <span className="text-blue-600 cursor-pointer font-medium">Cancellation Policy</span>.
        </p>
      </div>
    );
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Processing Payment</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Please do not close this window or refresh the page.</p>
          
          <div className="space-y-4 text-left bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {[
              { label: 'Connecting to Bank Gateway', delay: 0 },
              { label: 'Verifying Transaction Details', delay: 1500 },
              { label: 'Securing Booking Confirmation', delay: 3500 },
              { label: 'Finalizing Receipt', delay: 5000 }
            ].map((step, i) => (
              <ProcessingStep key={i} label={step.label} delay={step.delay} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Success Message */}
          {!showReceipt ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Payment Successful!</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-md mx-auto">
                Your booking for <strong>{bookingData.title}</strong> has been confirmed. 
                A confirmation email has been sent to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setShowReceipt(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  View Receipt
                </button>
                {onOpenMessages && (
                  <button
                    onClick={onOpenMessages}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-900 transition-all shadow-sm"
                  >
                    Open Messages
                  </button>
                )}
                <button 
                  onClick={handleDone}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* Receipt View */
            <div ref={receiptRef} id="printable-receipt" className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="bg-blue-600 p-8 text-white text-center relative">
                <div className="absolute top-4 left-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Official Receipt</div>
                <h2 className="text-2xl font-serif italic">Komrong Sanctuary</h2>
                <p className="text-xs opacity-80 mt-1">Riverside District, Komrong, Cambodia</p>
              </div>
              
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-50 dark:border-slate-800 pb-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{transactionId}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{transactionDate}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={bookingData.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{bookingData.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bookingData.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Check-in / Check-out</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{bookingData.dates}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Guests & Room</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{bookingData.details}</p>
                    </div>
                  </div>

                  <div className="space-y-4 py-6 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{tripData?.hotel?.name}</span>
                        <span className="text-slate-500">Accommodation</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">${(tripData?.hotel?.price || 0).toFixed(2)}</span>
                    </div>

                    {tripData?.rental?.isBooked && (
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{tripData?.rental?.name}</span>
                          <span className="text-slate-500">Transport</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">${(tripData?.rental?.price || 0).toFixed(2)}</span>
                      </div>
                    )}

                    {selectedActivities.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Activities</p>
                        {selectedActivities.map(activity => (
                          <div key={activity.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">{activity.name}</span>
                            <span className="font-bold text-slate-900 dark:text-white">${(activity.price * activity.guests).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Booking Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Taxes & Fees</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Service Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-lg font-serif italic text-slate-900 dark:text-white">Total Paid</span>
                    <span className="text-2xl font-bold text-blue-600">${bookingData.pricing.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedMethod.toUpperCase()} / KHQR</p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto no-print">
                    <button 
                      onClick={handlePrint}
                      className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Download PDF
                    </button>
                    <button 
                      onClick={handleDone}
                      className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  Thank you for choosing Komrong Sanctuary. We look forward to your visit!
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs no-print flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
          <span onClick={handleDone} className="hover:text-blue-600 cursor-pointer">HOME</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-600 cursor-pointer">TRIP DETAILS</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-blue-600">PAYMENT</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Booking Summary */}
          <div className={`${SHOW_LEGACY_PAYMENT_METHODS ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative">
                {(() => {
                  const images = galleryImages.length > 0 ? galleryImages : [bookingData.image];
                  const imagesToShow = images.slice(0, 4);
                  const extraCount = Math.max(0, images.length - imagesToShow.length);

                  return (
                    <div className={`grid ${imagesToShow.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 h-64 p-2`}>
                      {imagesToShow.map((src, idx) => (
                        <div key={`${src}-${idx}`} className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={src}
                            alt={bookingData.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          {extraCount > 0 && idx === imagesToShow.length - 1 && (
                            <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center">
                              <span className="text-white text-2xl font-extrabold tracking-tight">+{extraCount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                  {bookingData.location}
                </div>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{bookingData.title}</h2>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{bookingData.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{bookingData.details}</span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
                    {/* Hotel Details */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accommodation</p>
                      <div className="flex justify-between items-start text-[11px]">
                        <div className="flex-1 mr-2">
                          <p className="font-bold text-slate-900 dark:text-white">{tripData?.hotel?.name}</p>
                          <p className="text-slate-500">{tripData?.hotel?.roomType}</p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">${(tripData?.hotel?.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Rental Details */}
                    {tripData?.rental?.isBooked && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Transport</p>
                        <div className="flex justify-between items-start text-[11px]">
                          <div className="flex-1 mr-2">
                            <p className="font-bold text-slate-900 dark:text-white">{tripData?.rental?.name}</p>
                            <p className="text-slate-500">{tripData?.rental?.features}</p>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">${(tripData?.rental?.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {selectedActivities.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Activities</p>
                        <div className="space-y-2">
                          {selectedActivities.map(activity => (
                            <div key={activity.id} className="flex justify-between text-[11px]">
                              <span className="text-slate-500 line-clamp-1 flex-1 mr-2">{activity.name}</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">${(activity.price * activity.guests).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Trip Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Taxes & Fees</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Service Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bookingData.pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-3xl font-bold text-blue-600 tracking-tight">
                      ${bookingData.pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={handlePayment}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none group"
                  >
                    Scan QR Code ${bookingData.pricing.total.toFixed(2)}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="mt-3 text-center text-[10px] text-slate-400 leading-relaxed">
                    By clicking "Scan QR Code", you agree to Komrong's <span className="text-blue-600 cursor-pointer font-medium">Terms of Service</span> and <span className="text-blue-600 cursor-pointer font-medium">Cancellation Policy</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Safe & Secure Payment</h4>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 leading-relaxed">
                  Your transaction is protected by industry-leading 256-bit SSL encryption.
                </p>
              </div>
            </div>
          </div>

          <LegacyPaymentMethods />
        </div>
      </div>
    </div>
  );
};

export default Payment;
