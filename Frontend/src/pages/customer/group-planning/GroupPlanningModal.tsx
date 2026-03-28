import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, Plus, Users, X } from 'lucide-react';
import type { Member } from './types';

type NewActivityDraft = { time: string; activity: string; location: string };
type NewPollDraft = { question: string; options: string[] };

interface GroupPlanningModalProps {
  isAddingActivity: boolean;
  isCreatingPoll: boolean;
  isMembersOpen: boolean;
  isAddMemberOpen: boolean;
  isCopied: boolean;
  members: Member[];
  newMemberName: string;
  newMemberEmail: string;
  newActivity: NewActivityDraft;
  newPoll: NewPollDraft;
  setIsAddingActivity: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCreatingPoll: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMembersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddMemberOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewMemberName: React.Dispatch<React.SetStateAction<string>>;
  setNewMemberEmail: React.Dispatch<React.SetStateAction<string>>;
  setNewActivity: React.Dispatch<React.SetStateAction<NewActivityDraft>>;
  setNewPoll: React.Dispatch<React.SetStateAction<NewPollDraft>>;
  addMemberToGroup: () => void;
  copyToClipboard: () => void;
  handleAddActivity: () => void;
  handleCreatePoll: () => void;
}

const Backdrop: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <motion.div
    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    {children}
  </motion.div>
);

const Card: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <motion.div
    className="w-full max-w-xl rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-white/10 shadow-2xl overflow-hidden"
    initial={{ opacity: 0, y: 16, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 16, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
  >
    <div className="px-7 py-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="p-7">{children}</div>
  </motion.div>
);

export const GroupPlanningModal: React.FC<GroupPlanningModalProps> = (props) => {
  const {
    isAddingActivity,
    isCreatingPoll,
    isMembersOpen,
    isAddMemberOpen,
    isCopied,
    members,
    newMemberName,
    newMemberEmail,
    newActivity,
    newPoll,
    setIsAddingActivity,
    setIsCreatingPoll,
    setIsMembersOpen,
    setIsAddMemberOpen,
    setNewMemberName,
    setNewMemberEmail,
    setNewActivity,
    setNewPoll,
    addMemberToGroup,
    copyToClipboard,
    handleAddActivity,
    handleCreatePoll,
  } = props;

  const closeAll = () => {
    setIsAddingActivity(false);
    setIsCreatingPoll(false);
    setIsMembersOpen(false);
    setIsAddMemberOpen(false);
  };

  const active =
    isAddMemberOpen
      ? 'add-member'
      : isMembersOpen
        ? 'members'
        : isAddingActivity
          ? 'add-activity'
          : isCreatingPoll
            ? 'create-poll'
            : null;

  return (
    <AnimatePresence>
      {active && (
        <Backdrop onClose={closeAll}>
          {active === 'members' && (
            <Card title="Members" onClose={() => setIsMembersOpen(false)}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    copyToClipboard();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 hover:bg-blue-600/15 font-bold text-xs"
                >
                  <Copy className="w-4 h-4" />
                  {isCopied ? 'Copied!' : 'Copy invite link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMembersOpen(false);
                    setIsAddMemberOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add member
                </button>
              </div>

              <div className="mt-6 space-y-3 max-h-[50vh] overflow-auto pr-1">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet.</p>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.user_email}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 flex items-center justify-center font-extrabold">
                          {String(m.user_name || m.user_email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{m.user_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{m.user_email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                        {m.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {active === 'add-member' && (
            <Card title="Add Member" onClose={() => setIsAddMemberOpen(false)}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Name
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Member name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMemberOpen(false);
                      setIsMembersOpen(true);
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={addMemberToGroup}
                    className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_18px_40px_rgba(37,99,235,0.22)]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </Card>
          )}

          {active === 'add-activity' && (
            <Card title="Add Itinerary Item" onClose={() => setIsAddingActivity(false)}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Time
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity((prev) => ({ ...prev, time: e.target.value }))}
                    placeholder="09:00"
                    type="time"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Activity
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newActivity.activity}
                    onChange={(e) => setNewActivity((prev) => ({ ...prev, activity: e.target.value }))}
                    placeholder="Visit Angkor Wat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Location (optional)
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Siem Reap"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingActivity(false)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </Card>
          )}

          {active === 'create-poll' && (
            <Card title="Create Poll" onClose={() => setIsCreatingPoll(false)}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                    Question
                  </label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="What should we do first?"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewPoll((prev) => ({ ...prev, options: [...prev.options, ''] }))}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add option
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {newPoll.options.map((opt, idx) => (
                      <input
                        key={idx}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        value={opt}
                        onChange={(e) =>
                          setNewPoll((prev) => ({
                            ...prev,
                            options: prev.options.map((value, i) => (i === idx ? e.target.value : value)),
                          }))
                        }
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPoll(false)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePoll}
                    className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Create
                  </button>
                </div>
              </div>
            </Card>
          )}
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

