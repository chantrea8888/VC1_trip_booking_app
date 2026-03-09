import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Check, 
  Clock, 
  Download, 
  MessageCircle, 
  ArrowLeft,
  X
} from 'lucide-react';

interface ScanToPayProps {
  bookingDetails: {
    id: string;
    route: string;
    date: string;
    passengers: number;
    amountUsd: number;
    amountKhr: number;
  };
  onSuccess: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export const ScanToPay: React.FC<ScanToPayProps> = ({ 
  bookingDetails, 
  onSuccess, 
  onBack, 
  onCancel 
}) => {
  const [timeLeft, setTimeLeft] = useState(598); // 09:58 in seconds

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate a thorough check with the bank API
    setTimeout(() => {
      onSuccess();
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trip Details</span>
            </div>
            <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                2
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Payment</span>
            </div>
            <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                3
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scan to Pay</h2>
                  <p className="text-xs text-slate-400">ABA Bank KHQR Merchant</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="p-8 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-64 h-80 bg-[#006A66] rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl">
                    <div className="w-full bg-white/10 rounded-lg py-2 text-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">Payment A</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-inner">
                      {/* Placeholder for QR Code */}
                      <div className="w-32 h-32 bg-white flex flex-col items-center justify-center relative">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABA-PAYMENT-DEMO" 
                          alt="QR Code" 
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-[8px]">
                            KHQR
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-60 mb-1">ABA Merchant</p>
                      <p className="text-xs font-bold text-white">Komrong Travel Co., Ltd</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Waiting for transaction...</span>
                  </div>
                  
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        I have completed the payment
                      </>
                    )}
                  </button>

                  <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold transition-colors">
                    <Download className="w-4 h-4" />
                    Save QR Code Image
                  </button>
                </div>

                <div className="mt-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">How to Pay</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <span className="text-sm font-bold text-blue-600">1.</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Open the ABA Mobile app or any KHQR supported bank app.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-sm font-bold text-blue-600">2.</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Tap on the Scan QR button on your mobile device.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-sm font-bold text-blue-600">3.</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Scan the code and confirm the payment on your phone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Transaction Details</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking For</span>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-widest">
                      {bookingDetails.id}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{bookingDetails.route}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {bookingDetails.date} • {bookingDetails.passengers} Passenger{bookingDetails.passengers > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Amount in USD</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">${bookingDetails.amountUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Amount in KHR</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-blue-600">៛ {bookingDetails.amountKhr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-[32px] p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Having trouble?</h4>
                  <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 leading-relaxed mb-3">
                    If your scan isn't working, try refreshing the page or contact our support team.
                  </p>
                  <button className="text-xs font-bold text-blue-600 hover:underline">Open Live Support</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={onBack}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to payment methods
              </button>
              <button 
                onClick={onCancel}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
