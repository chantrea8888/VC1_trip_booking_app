import React from 'react';
import { cn } from '../../../../utils/utils';

interface GeneralSettingsSectionProps {
  defaultCurrency: string;
  onDefaultCurrencyChange: (currency: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  defaultCurrency,
  onDefaultCurrencyChange,
  theme,
  onThemeChange,
}) => {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Site Information</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic identification settings for the platform.</p>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Site Name</label>
            <input className="input-base" type="text" defaultValue="Komrong Global" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Contact Email</label>
            <input className="input-base" type="email" defaultValue="admin@komrong.com" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Default Currency</label>
            <select
              className="select-base w-full appearance-none"
              value={defaultCurrency}
              onChange={(e) => onDefaultCurrencyChange(e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Maintenance Mode</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Prevent public access while updates are in progress.</p>
        </div>
        <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">Activate Maintenance</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Only administrators will be able to login.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Appearance</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose the interface theme for your admin panel.</p>
        </div>
        <div className="md:col-span-2 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={cn(
                'rounded-lg border px-4 py-3 text-left transition-colors',
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800',
              )}
            >
              <p className="font-semibold text-sm">Light Mode</p>
              <p className="text-xs text-slate-500 mt-1">Bright interface for daytime use.</p>
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={cn(
                'rounded-lg border px-4 py-3 text-left transition-colors',
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800',
              )}
            >
              <p className="font-semibold text-sm">Dark Mode</p>
              <p className="text-xs text-slate-500 mt-1">Low-glare interface for dark environments.</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
