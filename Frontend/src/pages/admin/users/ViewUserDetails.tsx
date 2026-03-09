import React from 'react';
import { X } from 'lucide-react';

export interface UserItem {
  name: string;
  id: string;
  email: string;
  role: string;
  status: string;
  date: string;
  avatar: string;
}

interface ViewUserDetailsProps {
  user: UserItem | null;
  onClose: () => void;
}

export const ViewUserDetails: React.FC<ViewUserDetailsProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold">User Details</h4>
            <button type="button" className="btn-ghost" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" alt="" />
            <div>
              <p className="text-base font-bold">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">User ID</p>
              <p className="font-semibold mt-1">{user.id}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Joined Date</p>
              <p className="font-semibold mt-1">{user.date}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Role</p>
              <p className="font-semibold mt-1">{user.role}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Status</p>
              <p className="font-semibold mt-1">{user.status}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
