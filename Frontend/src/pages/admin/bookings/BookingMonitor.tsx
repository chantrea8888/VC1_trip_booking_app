import React, { useMemo, useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../utils/utils';
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
        <span className="text-[11px] text-slate-400">vs last month</span>
      </div>
    </div>
  </div>
);

export const Bookings: React.FC = () => {
  const [bookingView, setBookingView] = useState<'all' | 'active' | 'archive'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'Cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Paid' | 'Pending' | 'Refunded'>('all');

  const bookings = [
    { id: 'BK-9482', customer: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane', dest: 'Siem Reap, KH', date: 'Oct 24, 2023', price: '$1,250.00', payment: 'Paid', status: 'Confirmed' },
    { id: 'BK-9475', customer: 'Robert Smith', avatar: 'https://i.pravatar.cc/150?u=robert', dest: 'Bali, ID', date: 'Nov 12, 2023', price: '$3,400.00', payment: 'Pending', status: 'Pending' },
    { id: 'BK-9460', customer: 'Alice Lu', avatar: 'https://i.pravatar.cc/150?u=alice', dest: 'Phuket, TH', date: 'Oct 18, 2023', price: '$850.00', payment: 'Refunded', status: 'Cancelled' },
    { id: 'BK-9452', customer: 'Michael K.', avatar: 'https://i.pravatar.cc/150?u=mike', dest: 'Kyoto, JP', date: 'Dec 05, 2023', price: '$2,100.00', payment: 'Paid', status: 'Confirmed' },
  ] as const;

  const filteredBookings = useMemo(() => {
    const byView = bookingView === 'active'
      ? bookings.filter((booking) => booking.status === 'Confirmed' || booking.status === 'Pending')
      : bookingView === 'archive'
        ? bookings.filter((booking) => booking.status === 'Cancelled')
        : bookings;

    return byView.filter((booking) => {
      const text = `${booking.id} ${booking.customer} ${booking.dest}`.toLowerCase();
      const matchesSearch = searchTerm.trim() === '' || text.includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || booking.payment === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookingView, searchTerm, statusFilter, paymentFilter]);

  const hasActiveFilters = searchTerm.trim() !== '' || statusFilter !== 'all' || paymentFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  const escapeCsv = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  };

  const handleExportCsv = () => {
    const header = ['Booking ID', 'Customer', 'Destination', 'Trip Date', 'Total Price', 'Payment', 'Status'];
    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.customer,
      booking.dest,
      booking.date,
      booking.price,
      booking.payment,
      booking.status,
    ]);

    const csv = [
      header.join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `bookings-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings Management</h2>

        <p className="text-slate-500">Manage and monitor all customer travel reservations efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Bookings" 
          value="1,284" 
          trend={12} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title="Pending Approvals" 
          value="42" 
          trend={5.2} 
          icon={Clock} 
        />
        <StatCard 
          title="Completed Trips" 
          value="1,150" 
          trend={-2.1} 
          icon={CheckCircle2} 
        />
        <StatCard 
          title="Total Revenue" 
          value="$124,500" 
          trend={18.4} 
          icon={TrendingUp} 
        />
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setBookingView('all')}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                bookingView === 'all'
                  ? 'font-bold bg-primary text-white shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700',
              )}
            >
              All Bookings
            </button>
            <button
              type="button"
              onClick={() => setBookingView('active')}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                bookingView === 'active'
                  ? 'font-bold bg-primary text-white shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700',
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setBookingView('archive')}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                bookingView === 'archive'
                  ? 'font-bold bg-primary text-white shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700',
              )}
            >
              Archive
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
                hasActiveFilters && "border-primary/50 text-primary"
              )}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="input-base"
                placeholder="Search by booking id, customer, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="select-base w-full h-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Confirmed' | 'Pending' | 'Cancelled')}
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                className="select-base w-full h-10"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'Paid' | 'Pending' | 'Refunded')}
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Trip Date</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-6 py-4 text-sm font-bold text-primary">#{booking.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={booking.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <span className="text-sm font-medium">{booking.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.dest}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.date}</td>
                    <td className="px-6 py-4 text-sm font-bold">{booking.price}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        booking.payment === 'Paid' ? "bg-emerald-50 text-emerald-600" : booking.payment === 'Pending' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      )}>
                        {booking.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold",
                        booking.status === 'Confirmed' ? "bg-blue-50 text-blue-600" : booking.status === 'Pending' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    No bookings match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#17335e] bg-slate-50/70 dark:bg-[#041533] flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">Showing {filteredBookings.length} of {bookings.length} entries</p>
          <div className="pagination-wrap">
            <button className="pagination-btn min-w-0 w-12 text-slate-400 dark:text-slate-500" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="pagination-btn pagination-btn-active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn min-w-0 w-12">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
