import React from 'react';
import { 
  ArrowLeft, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Target,
  Zap,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const CreatePromotion = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);

  const steps = [
    { id: 1, label: 'Promotion Type', icon: Target },
    { id: 2, label: 'Campaign Details', icon: Info },
    { id: 3, label: 'Rules & Limits', icon: Zap },
    { id: 4, label: 'Preview', icon: Layout },
  ];

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/promotions')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Create New Promotion</h3>
          <p className="text-sm text-slate-500 mt-1">Design a marketing campaign to drive more traffic to your services.</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                step >= s.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider hidden sm:block",
                step >= s.id ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={16} className="text-slate-300 hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="p-8 space-y-8">
            <h4 className="font-bold text-lg">Select Promotion Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Percentage Discount', desc: 'Offer a percentage off the total booking price.', icon: Tag, color: 'blue' },
                { title: 'Fixed Amount Off', desc: 'Deduct a specific dollar amount from the price.', icon: Zap, color: 'amber' },
                { title: 'Bundle Offer', desc: 'Buy one service, get another at a discount.', icon: Layout, color: 'emerald' },
                { title: 'Early Bird Special', desc: 'Reward guests who book well in advance.', icon: Calendar, color: 'purple' },
              ].map((type, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-600/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
                    type.color === 'blue' ? "bg-blue-600 text-white" :
                    type.color === 'amber' ? "bg-amber-500 text-white" :
                    type.color === 'emerald' ? "bg-emerald-500 text-white" :
                    "bg-purple-500 text-white"
                  )}>
                    <type.icon size={24} />
                  </div>
                  <h5 className="font-bold text-sm mb-1">{type.title}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Campaign Name</label>
                  <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. Water Festival Special" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Discount Value</label>
                  <div className="relative">
                    <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="20" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Start Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">End Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => step < 4 ? setStep(s => s + 1) : navigate('/promotions')}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {step === 4 ? 'Launch Campaign' : 'Continue'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePromotion;
