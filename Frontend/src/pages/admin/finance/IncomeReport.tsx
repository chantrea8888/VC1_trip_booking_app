import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Wallet } from 'lucide-react';

export const Finances: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finances Management</h2>
        <p className="text-slate-500">Track platform revenue, payouts, and financial performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Gross Revenue</p>
            <Wallet size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-black mt-2">$142,840</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Net Income</p>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-2">$98,520</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Payouts</p>
            <ArrowUpCircle size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black mt-2">$34,110</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Refunds</p>
            <ArrowDownCircle size={16} className="text-red-600" />
          </div>
          <p className="text-2xl font-black mt-2">$10,210</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold">Revenue Detail</h3>
        <p className="text-sm text-slate-500 mt-1">
          Detailed revenue analytics can be expanded here with monthly cashflow and payout history.
        </p>
      </div>
    </div>
  );
};


