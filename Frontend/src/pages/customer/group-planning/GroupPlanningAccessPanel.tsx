import React from 'react';
import { ArrowRight, Plus, Users } from 'lucide-react';

interface GroupPlanningAccessPanelProps {
  accessCode: string;
  error: string | null;
  onAccessCodeChange: (value: string) => void;
  onCreateGroup: () => void | Promise<void>;
  onJoinGroup: (event: React.FormEvent) => void | Promise<void>;
}

export const GroupPlanningAccessPanel: React.FC<GroupPlanningAccessPanelProps> = ({
  accessCode,
  error,
  onAccessCodeChange,
  onCreateGroup,
  onJoinGroup,
}) => {
  return (
    <div className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_55%)]" />

          <div className="relative p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <Users className="w-3.5 h-3.5" />
              Group Planning
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Plan together, book together
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
              Create a group to coordinate itinerary items and polls, or join an existing group with an access code.
            </p>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl" role="alert">
                {error}
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 backdrop-blur p-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">New group</p>
                <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">Create a group</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Start a new planning space and invite friends.
                </p>

                <button
                  type="button"
                  onClick={onCreateGroup}
                  className="mt-6 w-full px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition-all inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create group
                </button>
              </div>

              <div className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 backdrop-blur p-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">Have a code?</p>
                <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">Join a group</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Enter the 6-character access code shared by your group leader.
                </p>

                <form className="mt-6 space-y-4" onSubmit={onJoinGroup}>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      Access code
                    </label>
                    <input
                      value={accessCode}
                      onChange={(e) => onAccessCodeChange(e.target.value)}
                      placeholder="ABC123"
                      className="mt-2 w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold tracking-widest"
                      autoComplete="off"
                      maxLength={12}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all inline-flex items-center justify-center gap-2"
                  >
                    Join group
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

