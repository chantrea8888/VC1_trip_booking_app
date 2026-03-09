import React from 'react';

export const NotificationsSettingsSection: React.FC = () => {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control which system events trigger notifications.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          {['New booking created', 'Payment failed alerts', 'Owner application submitted'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-primary border-slate-300 focus:ring-primary" />
              <label className="text-sm text-slate-700 dark:text-slate-200">{item}</label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
