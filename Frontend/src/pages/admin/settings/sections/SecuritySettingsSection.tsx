import React from 'react';

export const SecuritySettingsSection: React.FC = () => {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Account Protection</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure admin accounts with stronger authentication methods.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Enforce Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Require all admins to verify using an authenticator app.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Session Timeout</label>
            <select className="select-base w-full" defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Password Policy</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define security standards for admin and staff credentials.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          {[
            { label: 'Minimum 8 characters', checked: true },
            { label: 'Require special characters', checked: true },
            { label: 'Require numeric values', checked: true },
            { label: 'Require uppercase and lowercase letters', checked: true },
            { label: 'Enforce password expiry (90 days)', checked: false },
          ].map((policy, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={policy.checked}
                className="rounded text-primary border-slate-300 focus:ring-primary"
              />
              <label className="text-sm text-slate-700 dark:text-slate-200">{policy.label}</label>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Login Protection</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reduce brute-force attempts and suspicious access.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Max Failed Login Attempts</label>
            <input className="input-base" type="number" min={3} max={10} defaultValue={5} />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="rounded text-primary border-slate-300 focus:ring-primary"
            />
            <label className="text-sm text-slate-700 dark:text-slate-200">Lock account for 15 minutes after limit is reached</label>
          </div>
        </div>
      </section>
    </div>
  );
};
