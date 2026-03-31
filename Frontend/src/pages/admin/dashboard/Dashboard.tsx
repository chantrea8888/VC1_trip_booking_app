import React, { useEffect, useState } from 'react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, 
  Building2,
  CalendarDays, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  UserCheck,
  CheckCircle2,
  MoreHorizontal,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { adminDashboardService } from '../../../services/adminDashboardService';

const StatCard = ({ title, value, trend, icon: Icon, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "card p-4 text-left w-full",
      onClick && "cursor-pointer hover:border-primary/30 hover:shadow-md"
    )}
  >
    <div className="flex items-start justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
        <Icon size={14} />
      </div>
    </div>
    <div className="mt-2.5">
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
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
  </button>
);

interface DashboardProps {
  onOpenTotalUsersDetails?: () => void;
  onOpenTotalOwnersDetails?: () => void;
  onOpenTotalBookingsDetails?: () => void;
  onOpenSystemIncomeDetails?: () => void;
  onOpenOwnerApplicationsDetails?: () => void;
}

interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  role: 'User' | 'Owner' | 'Admin';
  status: 'Active' | 'Pending';
  date: string;
}

interface PendingOwner {
  id: string | number;
  name: string;
  email: string;
  business: string;
  status: 'Pending';
  date: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenTotalUsersDetails,
  onOpenTotalOwnersDetails,
  onOpenTotalBookingsDetails,
  onOpenSystemIncomeDetails,
  onOpenOwnerApplicationsDetails,
}) => {
  // State for statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersTrend: 0,
    totalOwners: 0,
    ownersTrend: 0,
    totalBookings: 0,
    bookingsTrend: 0,
    systemIncome: 0,
    incomeTrend: 0,
  });

  // State for income chart
  const [incomeRange, setIncomeRange] = useState<'1W' | '1M' | '1Y'>('1M');
  const [incomeData, setIncomeData] = useState<any[]>([]);

  // State for recent users
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'User' | 'Owner'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionUserId, setOpenActionUserId] = useState<string | number | null>(null);

  // State for pending owners
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [pendingOwnersCount, setPendingOwnersCount] = useState(0);

  // State for loading
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [statsData, recentUsersData, pendingOwnersData, pendingCountData] = await Promise.all([
          adminDashboardService.getStatistics(),
          adminDashboardService.getRecentUsers(10),
          adminDashboardService.getPendingOwners(5),
          adminDashboardService.getPendingOwnersCount(),
        ]);

        setStats(statsData);
        setUsers(recentUsersData);
        setPendingOwners(pendingOwnersData);
        setPendingOwnersCount(pendingCountData.count);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch income data when range changes
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const data = await adminDashboardService.getIncomeOverview(incomeRange);
        setIncomeData(data);
      } catch (error) {
        console.error('Failed to fetch income data:', error);
      }
    };

    fetchIncomeData();
  }, [incomeRange]);

  const filteredRecentUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Format income value to currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDeleteUser = (userId: string | number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setOpenActionUserId(null);
  };

  interface RecentUserWithStringId {
    id: string | number;
    name: string;
    email: string;
    role: 'User' | 'Owner' | 'Admin';
    status: 'Active' | 'Pending';
    date: string;
  }

  const handleOpenUserDetails = (user: RecentUserWithStringId) => {
    if (user.role === 'Owner' && user.status === 'Pending') {
      onOpenOwnerApplicationsDetails?.();
      return;
    }

    if (user.role === 'Owner') {
      onOpenTotalOwnersDetails?.();
      return;
    }

    onOpenTotalUsersDetails?.();
  };

  const handleViewDetails = (user: RecentUserWithStringId) => {
    handleOpenUserDetails(user);
    setOpenActionUserId(null);
  };

  const handleEditUser = (userId: string | number) => {
    const currentUser = users.find((user) => user.id === userId);
    if (!currentUser) return;

    const updatedEmail = window.prompt('Update email address', currentUser.email);
    if (updatedEmail && updatedEmail.trim()) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, email: updatedEmail.trim() } : user,
        ),
      );
    }
    setOpenActionUserId(null);
  };

  const handleSuspendUser = (userId: string | number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Pending' } : user,
      ),
    );
    setOpenActionUserId(null);
  };

  const handleApproveUser = (userId: string | number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Active' } : user,
      ),
    );
    setOpenActionUserId(null);
  };

  const handleExportRecentUsers = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const rows = filteredRecentUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recent-user-management.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Overview</h2>
        <p className="text-slate-500">Real-time platform statistics and user activity monitoring.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            trend={stats.usersTrend} 
            icon={Users} 
            onClick={onOpenTotalUsersDetails}
          />
          <StatCard 
            title="Total Owners" 
            value={stats.totalOwners.toLocaleString()} 
            trend={stats.ownersTrend} 
            icon={Building2} 
            onClick={onOpenTotalOwnersDetails}
          />
          <StatCard 
            title="Total Bookings" 
            value={stats.totalBookings.toLocaleString()} 
            trend={stats.bookingsTrend} 
            icon={CalendarDays} 
            onClick={onOpenTotalBookingsDetails}
          />
          <StatCard 
            title="System Income" 
            value={formatCurrency(stats.systemIncome)} 
            trend={stats.incomeTrend} 
            icon={Wallet} 
            onClick={onOpenSystemIncomeDetails}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">System Income Overview</h3>
              <p className="text-sm text-slate-500">
                {incomeRange === '1W' && 'Performance for the last 7 days'}
                {incomeRange === '1M' && 'Performance for the last 6 months'}
                {incomeRange === '1Y' && 'Performance for the last 12 months'}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['1W', '1M', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setIncomeRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors',
                    incomeRange === range
                      ? 'bg-white dark:bg-slate-700 text-primary border-slate-200 dark:border-slate-600 shadow-sm'
                      : 'bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-white/70 dark:hover:bg-slate-700/60',
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          {incomeData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="Income" fill="#0052cc" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Approve Owners</h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">{pendingOwnersCount} Pending</span>
          </div>
          <div className="space-y-4">
            {pendingOwners.length > 0 ? (
              pendingOwners.map((owner) => (
                <div key={owner.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {owner.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{owner.name}</p>
                      <p className="text-xs text-slate-500">{owner.business}</p>
                    </div>
                  </div>
                  <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No pending owner applications</p>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenOwnerApplicationsDetails}
            className="w-full mt-2 py-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            View All Applications
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent User Management</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOpenTotalUsersDetails}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                View All Users
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
              >
                <Filter size={14} />
                Filter
              </button>
              <button
                type="button"
                onClick={handleExportRecentUsers}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'All' | 'User' | 'Owner')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                >
                  <option value="All">All Roles</option>
                  <option value="User">User</option>
                  <option value="Owner">Owner</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Pending')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{filteredRecentUsers.length} result(s)</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('All');
                    setStatusFilter('All');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecentUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenUserDetails(user)}
                          className="text-sm font-bold hover:text-primary hover:underline transition-colors text-left"
                        >
                          {user.name}
                        </button>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      user.status === 'Active' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : "bg-amber-500")}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{user.date}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => setOpenActionUserId((prev) => (prev === user.id ? null : user.id))}
                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openActionUserId === user.id && (
                      <div className="absolute right-6 top-10 z-10 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user)}
                          className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                        >
                          View Details
                        </button>
                        {user.status === 'Active' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditUser(user.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSuspendUser(user.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                            >
                              Suspend
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveUser(user.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredRecentUsers.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-center text-slate-500">
                    No users match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
