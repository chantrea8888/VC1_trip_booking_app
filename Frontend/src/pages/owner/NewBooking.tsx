import React from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  MapPin,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';

const NewBooking = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/bookings')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">New Booking Entry</h3>
          <p className="text-sm text-slate-500 mt-1">Manually enter a new booking for a customer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <User size={20} className="text-blue-600" />
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Full Name</label>
                  <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Email Address</label>
                  <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Phone Number</label>
                  <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="+855 12 345 678" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nationality</label>
                  <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. Cambodia" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-blue-600" />
                Service Selection
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Service Type</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none">
                    <option>Shared Shuttle</option>
                    <option>Private SUV</option>
                    <option>Luxury Villa</option>
                    <option>Boutique Hotel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Route / Destination</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none">
                    <option>Phnom Penh — Siem Reap</option>
                    <option>Phnom Penh — Sihanoukville</option>
                    <option>Siem Reap — Battambang</option>
                    <option>Kampot — Kep</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input type="time" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => navigate('/bookings')}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Confirm Booking
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <Users size={18} className="text-blue-600" />
              Pax Details
            </h4>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Guests</span>
              <div className="flex items-center gap-4">
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all">-</button>
                <span className="text-sm font-bold">2</span>
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all">+</button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <CreditCard size={18} className="text-blue-600" />
              Price Summary
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Base Fare (2x $15)</span>
                <span className="text-slate-900 dark:text-white">$30.00</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Service Fee</span>
                <span className="text-slate-900 dark:text-white">$2.50</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-xl font-bold text-blue-600">$32.50</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-2xl border border-blue-600/10 dark:border-blue-600/20">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0" size={20} />
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300 leading-relaxed font-medium">
                <strong>Instant Confirmation:</strong> This booking will be instantly confirmed and the customer will receive an email notification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
