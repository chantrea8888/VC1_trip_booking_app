import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../utils/utils';

export const Destinations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const destinations = [
    { name: 'Bali Retreat', id: 'D-1092', region: 'Southeast Asia', category: 'BEACH', price: '$850.00', status: 'Active', img: 'https://picsum.photos/seed/bali/200/200' },
    { name: 'Swiss Alps Explorer', id: 'D-1105', region: 'Europe', category: 'MOUNTAIN', price: '$1,200.00', status: 'Active', img: 'https://picsum.photos/seed/alps/200/200' },
    { name: 'NYC Urban Tour', id: 'D-1241', region: 'North America', category: 'CITY', price: '$1,500.00', status: 'Inactive', img: 'https://picsum.photos/seed/nyc/200/200' },
    { name: 'Golden Triangle India', id: 'D-1382', region: 'South Asia', category: 'CITY', price: '$750.00', status: 'Active', img: 'https://picsum.photos/seed/india/200/200' },
  ];

  const regions = ['All Regions', ...Array.from(new Set(destinations.map((dest) => dest.region)))];
  const categories = ['All Categories', ...Array.from(new Set(destinations.map((dest) => dest.category)))];

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'All Regions' || dest.region === selectedRegion;
      const matchesCategory = selectedCategory === 'All Categories' || dest.category === selectedCategory;
      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [destinations, searchQuery, selectedRegion, selectedCategory]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Destinations Management</h2>
          <p className="text-slate-500 mt-1">Manage and curate travel locations for the booking platform</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="input-base pl-10" 
            placeholder="Search destinations by name or region..." 
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select-base min-w-[200px]"
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <select
            className="select-base min-w-[200px]"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-primary transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="table-header border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Destination Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Region</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Base Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredDestinations.map((dest, i) => (
              <tr key={i} className="table-row">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <img src={dest.img} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{dest.name}</p>
                      <p className="text-xs text-slate-500">ID: {dest.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dest.region}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold",
                    dest.category === 'BEACH' ? "bg-blue-100 text-blue-700" : dest.category === 'MOUNTAIN' ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {dest.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{dest.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    dest.status === 'Active' ? "text-emerald-600" : "text-slate-400"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", dest.status === 'Active' ? "bg-emerald-500" : "bg-slate-400")}></span>
                    {dest.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors hover:text-primary transition-colors">
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs hover:text-primary transition-colors hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#17335e] flex items-center justify-between bg-slate-50/70 dark:bg-[#041533]">
          <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to {filteredDestinations.length} of {destinations.length} results</span>
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


