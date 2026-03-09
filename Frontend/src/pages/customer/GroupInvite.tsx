import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Send, CheckCircle2, Copy } from 'lucide-react';

export const GroupInvite: React.FC = () => {
  const [inviteLink] = useState('https://komrong.com/invite/abc123xyz');
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Group Invite</h1>
          <p className="text-slate-500 dark:text-slate-400">Invite your friends to your next adventure and split the costs.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Invite Link</h2>
              <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <input type="text" value={inviteLink} readOnly className="bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 text-sm w-full font-medium" />
                <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">Share this link with your friends to join your group booking.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Invite via Email</h2>
              <div className="space-y-4">
                <input type="email" placeholder="friend@example.com" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 dark:text-white" />
                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none">
                  <Send className="w-5 h-5" /> Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
