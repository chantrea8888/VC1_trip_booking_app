import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Users, 
  CreditCard, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Camera,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('profile');

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'permissions', label: 'Team Permissions', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const teamMembers = [
    { name: 'Alex Sterling', role: 'Owner', email: 'alex@komroung.com', status: 'active', avatar: 'https://i.pravatar.cc/150?u=20' },
    { name: 'Sopheap Kim', role: 'Manager', email: 'sopheap@komroung.com', status: 'active', avatar: 'https://i.pravatar.cc/150?u=21' },
    { name: 'Vannak Som', role: 'Driver', email: 'vannak@komroung.com', status: 'active', avatar: 'https://i.pravatar.cc/150?u=22' },
    { name: 'Rithy Bun', role: 'Driver', email: 'rithy@komroung.com', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=23' },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Portal Settings</h3>
          <p className="text-sm text-slate-500 mt-1">Manage your business information and team access.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                      <img alt="Business Logo" className="w-full h-full object-cover" src="https://picsum.photos/seed/logo/200/200" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-xl font-bold">Sterling Travel Co.</h4>
                    <p className="text-sm text-slate-500 mt-1">Premium Travel Partner in Cambodia</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">Verified Business</span>
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-800">Partner Since 2021</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Business Name</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" defaultValue="Sterling Travel Co." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" defaultValue="contact@sterlingtravel.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" defaultValue="+855 12 345 678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Business Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" defaultValue="Phnom Penh, Cambodia" />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold">Team Members</h4>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  <Plus size={16} /> Add Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      <th className="px-6 py-4">Member</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teamMembers.map((member, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img alt={member.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={member.avatar} />
                            <div>
                              <p className="text-sm font-bold">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{member.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full",
                            member.status === 'active' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", member.status === 'active' ? "bg-emerald-500" : "bg-amber-500 animate-pulse")}></span>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8">
              <h4 className="font-bold text-lg">Notification Preferences</h4>
              <div className="space-y-6">
                {[
                  { title: 'New Bookings', desc: 'Receive alerts when a new booking is confirmed.', active: true },
                  { title: 'Payment Payouts', desc: 'Get notified when a withdrawal is processed.', active: true },
                  { title: 'Customer Reviews', desc: 'Alert me when a guest leaves a new review.', active: false },
                  { title: 'System Updates', desc: 'Stay informed about portal maintenance and features.', active: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="max-w-md">
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{item.desc}</p>
                    </div>
                    <button className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      item.active ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                        item.active ? "left-7" : "left-1"
                      )}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8">
              <h4 className="font-bold text-lg">Security Settings</h4>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">Enable</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold">Password</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Last changed 3 months ago</p>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Update Password</button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-bold">Active Sessions</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">You are currently logged in on 2 devices</p>
                    </div>
                    <button className="text-xs font-bold text-rose-600 hover:underline">Log Out All Devices</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
