import React from 'react';
import { Copy, PlusCircle } from 'lucide-react';

export const PaymentGatewaysSettingsSection: React.FC = () => {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">API Key Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">External service integration credentials.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Public Production Key</span>
              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Active</span>
            </div>
            <div className="flex gap-2">
              <input
                className="input-base"
                type="password"
                readOnly
                value="pk_live_51Mv9LSIr8K0eS7p..."
              />
              <button className="btn-ghost">
                <Copy size={16} />
              </button>
            </div>
          </div>
          <button className="text-primary text-sm font-bold flex items-center gap-2 hover:underline">
            <PlusCircle size={16} />
            Generate New Key
          </button>
        </div>
      </section>
    </div>
  );
};
