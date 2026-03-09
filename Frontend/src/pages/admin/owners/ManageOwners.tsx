import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  Truck, 
  TrendingUp,
  Plus, 
  Filter, 
  FileText,
  Eye,
  Edit2, 
  Trash2, 
  Search,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../../../utils/utils';

type OwnerType = 'Accommodation' | 'Both';
type OwnerStatus = 'Active' | 'Inactive';

interface OwnerItem {
  business: string;
  owner: string;
  type: OwnerType;
  count: number;
  status: OwnerStatus;
}

const MetricCard = ({ title, value, trend, icon: Icon }: any) => (
  <div className="card p-4">
    <div className="flex items-start justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
        <Icon size={14} />
      </div>
    </div>
    <div className="mt-2.5">
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700">
          <TrendingUp size={10} />
          {trend}%
        </span>
        <p className="text-[11px] text-slate-400">vs last month</p>
      </div>
    </div>
  </div>
);

interface OwnerManagementProps {
  onViewAllApplications?: () => void;
  onViewOwnerDetails?: () => void;
}

export const OwnerManagement: React.FC<OwnerManagementProps> = ({ onViewAllApplications, onViewOwnerDetails }) => {
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [owners, setOwners] = useState<OwnerItem[]>([
    { business: 'Blue Horizon Villa', owner: 'John Doe', type: 'Accommodation', count: 12, status: 'Active' },
    { business: 'City Express Trans', owner: 'Jane Smith', type: 'Both', count: 8, status: 'Active' },
    { business: 'Mountain Retreat', owner: 'Robert Brown', type: 'Accommodation', count: 5, status: 'Inactive' },
    { business: 'Coastal Rides', owner: 'Emily Davis', type: 'Both', count: 15, status: 'Active' },
    { business: 'Urban Stay', owner: 'Michael Wilson', type: 'Accommodation', count: 3, status: 'Active' },
  ]);
  const [formData, setFormData] = useState({
    business: '',
    owner: '',
    type: 'Accommodation' as OwnerType,
    count: 1,
    status: 'Active' as OwnerStatus,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'All' as 'All' | OwnerType,
    status: 'All' as 'All' | OwnerStatus,
  });

  const filteredOwners = owners.filter((owner) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const matchesKeyword =
      keyword.length === 0 ||
      owner.business.toLowerCase().includes(keyword) ||
      owner.owner.toLowerCase().includes(keyword);
    const matchesType = filters.type === 'All' || owner.type === filters.type;
    const matchesStatus = filters.status === 'All' || owner.status === filters.status;

    return matchesKeyword && matchesType && matchesStatus;
  });

  const handleCreateOwner = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newOwner = {
      business: formData.business.trim(),
      owner: formData.owner.trim(),
      type: formData.type,
      count: Number(formData.count),
      status: formData.status,
    };

    setOwners((prev) => [newOwner, ...prev]);
    setFormData({ business: '', owner: '', type: 'Accommodation', count: 1, status: 'Active' });
    setIsAddOwnerOpen(false);
  };

  const openOwnerDetails = (_owner: OwnerItem) => {
    if (onViewOwnerDetails) {
      onViewOwnerDetails();
      return;
    }
  };

  return (
    <div className="p-8 space-y-8 relative">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Owners Management</h2>
        <p className="text-slate-500">Manage and oversee all registered business owners and their properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Owners" 
          value="1,248" 
          trend="4.8"
          icon={Building2} 
        />
        <MetricCard 
          title="Accommodation Owners" 
          value="892" 
          trend="3.1"
          icon={Home} 
        />
        <MetricCard 
          title="Accommodation & Transport" 
          value="356" 
          trend="2.4"
          icon={Truck} 
        />
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Owners List</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onViewAllApplications}
              className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={18} />
              <span>View All Applications</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isFilterOpen
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300",
              )}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            <button className="btn-primary" onClick={() => setIsAddOwnerOpen(true)}>
              <Plus size={18} />
              <span>Add New Owner</span>
            </button>
          </div>
        </div>
        {isFilterOpen && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                  placeholder="Search by business or owner name"
                  className="input-base pl-9"
                />
              </div>
              <select
                className="select-base w-full"
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as 'All' | OwnerType }))}
              >
                <option value="All">All Types</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Both">Both</option>
              </select>
              <div className="flex gap-2">
                <select
                  className="select-base w-full"
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as 'All' | OwnerStatus }))}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  type="button"
                  onClick={() => setFilters({ keyword: '', type: 'All', status: 'All' })}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Owner Name</th>
                <th className="px-6 py-4">Business Type</th>
                <th className="px-6 py-4">Destinations</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOwners.map((owner, i) => (
                <tr key={i} className="table-row">
                  <td className="px-6 py-4 text-sm font-semibold">{owner.business}</td>
                  <td className="px-6 py-4 text-sm">{owner.owner}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase",
                      owner.type === 'Accommodation' ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                    )}>
                      {owner.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{owner.count}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-sm font-medium",
                      owner.status === 'Active' ? "text-emerald-600" : "text-slate-400"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", owner.status === 'Active' ? "bg-emerald-500" : "bg-slate-400")}></span>
                      {owner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openOwnerDetails(owner);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors hover:text-primary transition-colors"
                      >
                        <Eye size={18} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors   hover:text-primary transition-colors"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOwners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No owners match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#17335e] bg-slate-50/70 dark:bg-[#041533] flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">Showing {filteredOwners.length} of {owners.length} owners</p>
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

      {isAddOwnerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={() => setIsAddOwnerOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateOwner} className="card w-full max-w-lg p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">Add New Owner</h4>
                <button type="button" className="btn-ghost" onClick={() => setIsAddOwnerOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Business Name</label>
                <input
                  className="input-base"
                  required
                  value={formData.business}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business: e.target.value }))}
                  placeholder="Enter business name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Owner Name</label>
                <input
                  className="input-base"
                  required
                  value={formData.owner}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
                  placeholder="Enter owner full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Business Type</label>
                  <select
                    className="select-base w-full"
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option>Accommodation</option>
                    <option>Both</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Destinations</label>
                  <input
                    type="number"
                    min={1}
                    className="input-base"
                    required
                    value={formData.count}
                    onChange={(e) => setFormData((prev) => ({ ...prev, count: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status</label>
                <select
                  className="select-base w-full"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold" onClick={() => setIsAddOwnerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Owner
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};
