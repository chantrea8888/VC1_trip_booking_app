import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  TrendingUp,
  TrendingDown,
  Search, 
  Filter, 
  Eye,
  EyeOff,
  Edit2, 
  Trash2, 
  X
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { ViewUserDetails, UserItem } from './ViewUserDetails';
import { apiRequest } from '../../../services/api';

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

type ApiUser = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  avatar?: string | null;
  profile_photo_url?: string | null;
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatRoleLabel = (value: unknown) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return 'Customer';
  return toTitleCase(normalized.replace(/_/g, ' '));
};

const formatStatusLabel = (user: ApiUser) => {
  const explicitStatus = String(user.status ?? '').trim();
  if (explicitStatus) return toTitleCase(explicitStatus.replace(/_/g, ' '));
  if (typeof user.is_active === 'boolean') return user.is_active ? 'Active' : 'Inactive';
  return 'Active';
};

const formatJoinedDate = (value: unknown) => {
  const parsed = value ? new Date(String(value)) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const buildAvatar = (user: ApiUser) =>
  String(user.avatar || user.profile_photo_url || '').trim() ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(String(user.name || user.email || 'User'))}&background=E2E8F0&color=0F172A`;

const normalizeUser = (user: ApiUser): UserItem => ({
  name: String(user.name || 'Unknown User').trim(),
  id: String(user.id ?? ''),
  email: String(user.email || 'No email').trim(),
  role: formatRoleLabel(user.role),
  status: formatStatusLabel(user),
  date: formatJoinedDate(user.created_at),
  avatar: buildAvatar(user),
});

export const UserManagement: React.FC = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer',
    password: '',
    passwordConfirmation: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'All',
    status: 'All',
  });

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const payload = await apiRequest<{ data?: ApiUser[] } | ApiUser[]>('/users', { method: 'GET' });
        const records = Array.isArray(payload) ? payload : payload?.data || [];
        const normalized = records.map(normalizeUser);

        if (!active) return;
        setUsers(normalized);
      } catch (error) {
        if (!active) return;
        setUsers([]);
        setLoadError(error instanceof Error ? error.message : 'Failed to load users.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

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

  const stats = useMemo(() => {
    const customers = users.filter((user) => user.role === 'Customer').length;
    const owners = users.filter((user) => user.role === 'Owner').length;
    const newRegistrations = users.filter((user) => {
      if (user.date === 'N/A') return false;
      const joinedAt = new Date(user.date);
      if (Number.isNaN(joinedAt.getTime())) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joinedAt >= thirtyDaysAgo;
    }).length;

    return {
      customers,
      owners,
      newRegistrations,
    };
  }, [users]);

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(users.map((user) => user.role).filter(Boolean))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [users],
  );

  useEffect(() => {
    if (filters.role === 'All') return;
    if (roleOptions.includes(filters.role)) return;

    setFilters((prev) => ({ ...prev, role: 'All' }));
  }, [filters.role, roleOptions]);

  const openUserDetails = (user: UserItem) => {
    setSelectedUser(user);
  };

  const resetCreateForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Customer',
      password: '',
      passwordConfirmation: '',
    });
    setShowPassword(false);
    setShowPasswordConfirmation(false);
  };

  const closeCreateModal = () => {
    if (createSubmitting) return;
    setIsAddUserOpen(false);
    setCreateError(null);
    resetCreateForm();
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      setCreateError('Password confirmation does not match.');
      return;
    }

    try {
      setCreateSubmitting(true);
      setCreateError(null);

      const payload = await apiRequest<{ data?: ApiUser; message?: string }>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role.trim().toLowerCase(),
          password: formData.password,
          password_confirmation: formData.passwordConfirmation,
        }),
      });

      const createdUser = payload?.data;
      if (createdUser) {
        const normalized = normalizeUser(createdUser);
        setUsers((prev) => [normalized, ...prev]);
      }

      setIsAddUserOpen(false);
      setCreateError(null);
      resetCreateForm();
    } catch (error: any) {
      const validationErrors = error?.errors && typeof error.errors === 'object'
        ? Object.values(error.errors).flat().filter(Boolean).join(' ')
        : '';
      setCreateError(validationErrors || error?.message || 'Failed to create user.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Manage Users</h3>
          <p className="text-slate-500 text-sm">All accounts from the backend `users` table are shown here unless you apply filters.</p>
        </div>
        <button className="btn-primary py-2.5" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Customers" 
          value={loading ? '...' : String(stats.customers)} 
          trend={5.2}
          icon={UserCheck} 
        />
        <StatCard 
          title="Total Owners" 
          value={loading ? '...' : String(stats.owners)} 
          trend={8.1}
          icon={Users} 
        />
        <StatCard 
          title="New Registrations" 
          value={loading ? '...' : String(stats.newRegistrations)} 
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
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
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

        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header sticky top-0 z-[2]">
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading users from backend...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500">
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && !loadError && filteredUsers.map((user, i) => (
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
              {!loading && !loadError && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="sticky bottom-0 z-[1] border-t border-slate-200 dark:border-[#17335e] bg-white/95 dark:bg-[#041533]/95 backdrop-blur-md px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing all {filteredUsers.length} visible users
              {filteredUsers.length !== users.length ? ` from ${users.length} total users` : ''}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Results update instantly as you search or filter.
            </p>
          </div>
        </div>
      </div>

      {isAddUserOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={closeCreateModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateUser} className="card w-full max-w-xl p-6 sm:p-7 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Add New User</h4>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 break-words">
                    Fill in the backend-supported fields below to create a user in the users table.
                  </p>
                </div>
                <button type="button" className="btn-ghost" onClick={closeCreateModal} disabled={createSubmitting}>
                  <X size={16} />
                </button>
              </div>

              {createError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {createError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
                  <input
                    className="input-base h-12"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</label>
                  <input
                    type="email"
                    className="input-base h-12"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Role</label>
                  <select
                    className="select-base w-full h-12"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option>Customer</option>
                    <option>Owner</option>
                    <option>Admin</option>
                  </select>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 break-words">
                    Allowed roles: Customer, Owner, Admin.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</label>
                  <div className="input-base h-12 flex items-center font-medium">
                    Active
                  </div>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 break-words">
                    New users are created with the backend default status.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-base h-12 pr-12"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 inline-flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      className="input-base h-12 pr-12"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={formData.passwordConfirmation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, passwordConfirmation: e.target.value }))}
                      placeholder="Re-enter the password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                      className="absolute inset-y-0 right-3 inline-flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPasswordConfirmation ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold disabled:opacity-60"
                  onClick={closeCreateModal}
                  disabled={createSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary rounded-xl px-5 py-2.5 disabled:opacity-60" disabled={createSubmitting}>
                  {createSubmitting ? 'Creating...' : 'Create User'}
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


