import React from 'react';
import { Save } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { useTheme } from '../../../theme';
import { GeneralSettingsSection } from './sections/GeneralSettingsSection';
import { SecuritySettingsSection } from './sections/SecuritySettingsSection';
import { NotificationsSettingsSection } from './sections/NotificationsSettingsSection';
import { PaymentGatewaysSettingsSection } from './sections/PaymentGatewaysSettingsSection';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('General');
  const [defaultCurrency, setDefaultCurrency] = React.useState('EUR');
  const { theme, setTheme } = useTheme();
  const tabs = ['General', 'Security', 'Notifications', 'Payment Gateways'] as const;

  const renderActiveSection = () => {
    if (activeTab === 'General') {
      return (
        <GeneralSettingsSection
          defaultCurrency={defaultCurrency}
          onDefaultCurrencyChange={setDefaultCurrency}
          theme={theme}
          onThemeChange={setTheme}
        />
      );
    }

    if (activeTab === 'Security') {
      return <SecuritySettingsSection />;
    }

    if (activeTab === 'Notifications') {
      return <NotificationsSettingsSection />;
    }

    return <PaymentGatewaysSettingsSection />;
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>

          <p className="text-slate-500 dark:text-slate-400 text-base">Configure your platform's core behavior, security protocols, and external integrations.</p>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 px-1 text-sm font-bold whitespace-nowrap transition-all",
                activeTab === tab 
                  ? "border-b-2 border-primary text-primary" 
                  : "border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {renderActiveSection()}

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
        <button className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Discard Changes
        </button>
        <button className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
};


