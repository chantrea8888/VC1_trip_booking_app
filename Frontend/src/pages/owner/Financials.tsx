import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  History, 
  ShieldCheck, 
  Download,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';

const Financials = () => {
  const navigate = useNavigate();
  const payouts = [
    { id: 'PAY-8821', date: 'Oct 20, 2024', amount: 1240.50, method: 'ABA Bank', status: 'completed' },
    { id: 'PAY-8820', date: 'Oct 13, 2024', amount: 980.00, method: 'ABA Bank', status: 'completed' },
    { id: 'PAY-8819', date: 'Oct 06, 2024', amount: 1560.25, method: 'Wing Bank', status: 'completed' },
    { id: 'PAY-8818', date: 'Sep 29, 2024', amount: 1120.00, method: 'ABA Bank', status: 'completed' },
    { id: 'PAY-8817', date: 'Sep 22, 2024', amount: 840.00, method: 'ABA Bank', status: 'completed' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Financial Overview</h3>
          <p className="text-sm text-slate-500 mt-1">Manage your earnings, payouts, and payment methods.</p>
        </div>
        <button 
          onClick={() => navigate('/financials/withdraw')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <ArrowUpRight size={18} /> Withdraw Funds
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Wallet size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">Available</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100 mb-1">Current Balance</p>
            <h3 className="text-4xl font-bold tracking-tight">$4,248.50</h3>
            <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Next payout: Oct 27, 2024
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
              <ArrowDownRight size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">This Month</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Total Earnings</p>
          <h3 className="text-3xl font-bold tracking-tight">$12,845.50</h3>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-emerald-600">
            <TrendingUp size={14} /> +14.2% from last month
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <History size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">All Time</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Total Payouts</p>
          <h3 className="text-3xl font-bold tracking-tight">$84,240.00</h3>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <CheckCircle2 size={14} /> 64 successful payouts
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold">Recent Payout History</h4>
            <button className="text-xs text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <th className="px-6 py-4">Payout ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-300">{payout.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{payout.date}</td>
                    <td className="px-6 py-4 text-sm font-bold">${payout.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{payout.method}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">Payment Methods</h4>
              <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'ABA Bank', account: '**** 8842', type: 'Primary', icon: CreditCard },
                { name: 'Wing Bank', account: '**** 3321', type: 'Secondary', icon: CreditCard },
              ].map((method, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-600/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all">
                      <method.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{method.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{method.account}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    method.type === 'Primary' ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}>
                    {method.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600/5 dark:bg-emerald-600/10 p-6 rounded-2xl border border-emerald-600/10 dark:border-emerald-600/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-600 mb-1">Secure Settlements</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">All payouts are processed through secure Cambodian banking channels with 256-bit encryption.</p>
                <button className="mt-4 text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 uppercase tracking-[0.1em] hover:gap-2 transition-all">
                  Security Policy <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;
