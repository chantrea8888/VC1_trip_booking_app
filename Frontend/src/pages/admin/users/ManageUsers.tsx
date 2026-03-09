import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  TrendingUp,
  TrendingDown,
  Search, 
  Filter, 
  Eye,
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { ViewUserDetails, UserItem } from './ViewUserDetails';

const StatCard = ({ title, value, trend, icon: Icon }: any) => (
  <div className="card p-4">
    <div className="flex items-start justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
        <Icon size={14} />
      </div>
    </div>
    <div className="mt-2.5">
      <h4 className="text-2xl font-black tracking-tight">{value}</h4>
      <div className="flex items-center gap-1.5 mt-1.5">
      <span className={cn(
          "text-[11px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5",
          trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
      )}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
      </span>
        <p className="text-[11px] text-slate-400">vs last month</p>
      </div>
    </div>
  </div>
);

export const UserManagement: React.FC = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([
    { name: 'Sarah Jenkins', id: 'USR-8820', email: 'sarah.j@hotelcorp.com', role: 'Owner', status: 'Inactive', date: 'Nov 05, 2023', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Michael Chen', id: 'USR-7731', email: 'm.chen@outlook.com', role: 'Customer', status: 'Pending', date: 'Dec 20, 2023', avatar: 'https://i.pravatar.cc/150?u=michael' },
    { name: 'Elena Rodriguez', id: 'USR-6122', email: 'elena.rod@travel.io', role: 'Customer', status: 'Active', date: 'Jan 12, 2024', avatar: 'https://i.pravatar.cc/150?u=elena' },
    { name: 'Jordan Smith', id: 'USR-5501', email: 'jordan.smith@villas.net', role: 'Owner', status: 'Active', date: 'Jan 28, 2024', avatar: 'https://i.pravatar.cc/150?u=jordan' },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer',
    status: 'Active',
    password: '',
  });
  const [filters, setFilters] = useState({
    search: '',
    role: 'All',
    status: 'All',
  });

  const filteredUsers = users.filter((user) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search);
    const matchesRole = filters.role === 'All' || user.role === filters.role;
    const matchesStatus = filters.status === 'All' || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const openUserDetails = (user: UserItem) => {
    setSelectedUser(user);
  };

  const handleCreateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      name: formData.name.trim(),
      id: newId,
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.email.trim())}`,
    };

    setUsers((prev) => [newUser, ...prev]);
    setFormData({ name: '', email: '', role: 'Customer', status: 'Active', password: '' });
    setIsAddUserOpen(false);
  };

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Manage Platform Users</h3>
          <p className="text-slate-500 text-sm">Monitor activity, approve owners, and manage permissions.</p>
        </div>
        <button className="btn-primary py-2.5" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Customers" 
          value="8,210" 
          trend={5.2} 
          icon={UserCheck} 
        />
        <StatCard 
          title="Total Owners" 
          value="4,150" 
          trend={8.1} 
          icon={Users} 
        />
        <StatCard 
          title="New Registrations" 
          value="124" 
          trend={-2.4} 
          icon={UserPlus} 
        />
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="input-base pl-10" 
                placeholder="Search by name, email or ID..." 
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
                isFilterOpen
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
              )}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
          {isFilterOpen && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                className="select-base"
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Owner">Owner</option>
                <option value="Customer">Customer</option>
                <option value="Support">Support</option>
              </select>
              <select
                className="select-base"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
              <button
                type="button"
                onClick={() => setFilters({ search: '', role: 'All', status: 'All' })}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user, i) => (
                <tr key={i} className="table-row cursor-pointer" onClick={() => openUserDetails(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-500">ID: #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      user.role === 'Owner' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-sm font-medium",
                      user.status === 'Active' ? "text-emerald-600" : user.status === 'Pending' ? "text-amber-500" : "text-slate-400"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : user.status === 'Pending' ? "bg-amber-500" : "bg-slate-400")}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openUserDetails(user);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#17335e] bg-slate-50/70 dark:bg-[#041533] flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">Showing {filteredUsers.length} of {users.length} users</p>
          <div className="pagination-wrap">
            <button className="pagination-btn min-w-0 w-12 text-slate-400 dark:text-slate-500" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="pagination-btn pagination-btn-active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span className="pagination-dots">...</span>
            <button className="pagination-btn min-w-[68px]">2568</button>
            <button className="pagination-btn min-w-0 w-12">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {isAddUserOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={() => setIsAddUserOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateUser} className="card w-full max-w-lg p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">Add New User</h4>
                <button type="button" className="btn-ghost" onClick={() => setIsAddUserOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  className="input-base"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  className="input-base"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Role</label>
                  <select
                    className="select-base w-full"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option>Admin</option>
                    <option>Owner</option>
                    <option>Customer</option>
                    <option>Support</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    className="select-base w-full"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Temporary Password</label>
                <input
                  type="password"
                  className="input-base"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <ViewUserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};


