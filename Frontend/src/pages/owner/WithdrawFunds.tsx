import React from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';

const WithdrawFunds = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-[800px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/financials')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Withdraw Funds</h3>
          <p className="text-sm text-slate-500 mt-1">Transfer your earnings to your verified bank account.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Select Withdrawal Method</label>
                <div className="space-y-3">
                  {[
                    { name: 'ABA Bank', account: '**** 8842', primary: true },
                    { name: 'Wing Bank', account: '**** 3321', primary: false },
                  ].map((method, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group",
                      method.primary ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-600/30"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          method.primary ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-400"
                        )}>
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{method.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{method.account}</p>
                        </div>
                      </div>
                      {method.primary && <CheckCircle2 size={18} className="text-blue-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-bold" placeholder="0.00" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Available balance: $4,248.50</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Security Code (OTP)</label>
                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium tracking-[0.5em] text-center" placeholder="******" maxLength={6} />
                <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">Enter the 6-digit code sent to your phone.</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/financials')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Confirm Withdrawal
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <Wallet size={18} className="text-blue-600" />
              Withdrawal Summary
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Amount to Withdraw</span>
                <span className="text-slate-900 dark:text-white">$0.00</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Processing Fee</span>
                <span className="text-slate-900 dark:text-white">$0.00</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span className="text-sm font-bold">Total Settlement</span>
                <span className="text-xl font-bold text-blue-600">$0.00</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600/5 dark:bg-emerald-600/10 p-6 rounded-2xl border border-emerald-600/10 dark:border-emerald-600/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 leading-relaxed font-medium">
                <strong>Secure Transaction:</strong> Your withdrawal request will be processed within 2-4 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;
