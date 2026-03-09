import React from 'react';
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
  Download
} from 'lucide-react';
import { cn } from '../../../utils/utils';

const data = [
  { name: 'JAN', income: 400, expenses: 220 },
  { name: 'FEB', income: 300, expenses: 170 },
  { name: 'MAR', income: 600, expenses: 350 },
  { name: 'APR', income: 450, expenses: 260 },
  { name: 'MAY', income: 900, expenses: 540 },
  { name: 'JUN', income: 700, expenses: 430 },
];

const incomeOverviewData = {
  '1W': [
    { name: 'MON', income: 180, expenses: 90 },
    { name: 'TUE', income: 240, expenses: 120 },
    { name: 'WED', income: 210, expenses: 110 },
    { name: 'THU', income: 310, expenses: 170 },
    { name: 'FRI', income: 350, expenses: 200 },
    { name: 'SAT', income: 280, expenses: 160 },
    { name: 'SUN', income: 260, expenses: 140 },
  ],
  '1M': data,
  '1Y': [
    { name: 'JAN', income: 400, expenses: 220 },
    { name: 'FEB', income: 360, expenses: 200 },
    { name: 'MAR', income: 520, expenses: 300 },
    { name: 'APR', income: 480, expenses: 270 },
    { name: 'MAY', income: 620, expenses: 350 },
    { name: 'JUN', income: 700, expenses: 410 },
    { name: 'JUL', income: 760, expenses: 440 },
    { name: 'AUG', income: 690, expenses: 400 },
    { name: 'SEP', income: 640, expenses: 360 },
    { name: 'OCT', income: 820, expenses: 470 },
    { name: 'NOV', income: 910, expenses: 530 },
    { name: 'DEC', income: 980, expenses: 580 },
  ],
} as const;

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
  id: number;
  name: string;
  email: string;
  role: 'User' | 'Owner';
  status: 'Active' | 'Pending';
  date: string;
}

const recentUsers: RecentUser[] = [
  { id: 1, name: 'Lilly Dawson', email: 'lilly.d@example.com', role: 'User', status: 'Active', date: 'Oct 24, 2023' },
  { id: 2, name: 'David Miller', email: 'd.miller@example.com', role: 'Owner', status: 'Pending', date: 'Oct 22, 2023' },
  { id: 3, name: 'Ethan Brown', email: 'ethan.b@example.com', role: 'User', status: 'Pending', date: 'Oct 21, 2023' },
  { id: 4, name: 'Clara Reed', email: 'clara.r@example.com', role: 'Owner', status: 'Active', date: 'Oct 18, 2023' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenTotalUsersDetails,
  onOpenTotalOwnersDetails,
  onOpenTotalBookingsDetails,
  onOpenSystemIncomeDetails,
  onOpenOwnerApplicationsDetails,
}) => {
  const [incomeRange, setIncomeRange] = React.useState<'1W' | '1M' | '1Y'>('1M');
  const [users, setUsers] = React.useState<RecentUser[]>(recentUsers);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'All' | 'User' | 'Owner'>('All');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Pending'>('All');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [openActionUserId, setOpenActionUserId] = React.useState<number | null>(null);
  const incomeData = incomeOverviewData[incomeRange];

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

  const handleDeleteUser = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setOpenActionUserId(null);
  };

  const handleOpenUserDetails = (user: RecentUser) => {
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

  const handleViewDetails = (user: RecentUser) => {
    handleOpenUserDetails(user);
    setOpenActionUserId(null);
  };

  const handleEditUser = (userId: number) => {
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

  const handleSuspendUser = (userId: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Pending' } : user,
      ),
    );
    setOpenActionUserId(null);
  };

  const handleApproveUser = (userId: number) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="24,512" 
          trend={12.5} 
          icon={Users} 
          onClick={onOpenTotalUsersDetails}
        />
        <StatCard 
          title="Total Owners" 
          value="1,842" 
          trend={4.2} 
          icon={Building2} 
          onClick={onOpenTotalOwnersDetails}
        />
        <StatCard 
          title="Total Bookings" 
          value="58,190" 
          trend={18.1} 
          icon={CalendarDays} 
          onClick={onOpenTotalBookingsDetails}
        />
        <StatCard 
          title="System Income" 
          value="$142,840" 
          trend={9.3} 
          icon={Wallet} 
          onClick={onOpenSystemIncomeDetails}
        />
      </div>

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
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Approve Owners</h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">4 Pending</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Marc Stevens', business: 'Mountain Lodge', avatar: 'https://i.pravatar.cc/150?u=marc' },
              { name: 'Elena Rossi', business: 'Urban Loft Stay', avatar: 'https://i.pravatar.cc/150?u=elena' },
              { name: 'James Wu', business: 'Island Villas', avatar: 'https://i.pravatar.cc/150?u=james' },
            ].map((owner, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={owner.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-sm font-bold">{owner.name}</p>
                    <p className="text-xs text-slate-500">{owner.business}</p>
                  </div>
                </div>
                <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                  <CheckCircle2 size={20} />
                </button>
              </div>
            ))}
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
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative">
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
          {isFilterOpen && (
            <div className="absolute right-6 top-[calc(100%-10px)] z-20 w-[320px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
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
