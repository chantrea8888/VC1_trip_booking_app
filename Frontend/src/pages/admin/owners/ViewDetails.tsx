import React from 'react';
import {
  ArrowLeft,
  BadgeDollarSign,
  BookCheck,
  Building2,
  Edit2,
  MapPin,
  MoreVertical,
  PauseCircle,
  Star,
  Trash2,
} from 'lucide-react';

interface ViewDetailsProps {
  onBack: () => void;
}

export const ViewDetails: React.FC<ViewDetailsProps> = ({ onBack }) => {
  const destinations = [
    { name: 'Ocean View Suite', price: '$299/night', status: 'Available', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop' },
    { name: 'Garden Bungalow', price: '$185/night', status: 'Available', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=120&h=120&fit=crop' },
    { name: 'Skyline Penthouse', price: '$550/night', status: 'Maintenance', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=120&fit=crop' },
    { name: 'Family Beach Cabin', price: '$320/night', status: 'Available', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=120&h=120&fit=crop' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold hover:text-primary transition-all duration-200 ease-out active:scale-[0.98]"
        >
          <ArrowLeft size={16} />
          Back to Owner Management
        </button>
      </div>

      <div className="card p-4 md:p-5 space-y-5 md:space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=150&h=150&fit=crop"
              alt="Blue Horizon Villa"
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Blue Horizon Villa</h2>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Active</span>
              </div>
              <p className="mt-1.5 text-sm md:text-base text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
                <Building2 size={16} />
                Accommodation Business
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out active:scale-[0.98]">
              <Edit2 size={14} />
              Edit
            </button>
            <button type="button" className="px-3 py-2 rounded-lg border border-orange-200 text-orange-600 inline-flex items-center gap-1.5 text-sm font-semibold hover:bg-orange-50 transition-all duration-200 ease-out active:scale-[0.98]">
              <PauseCircle size={14} />
              Suspend
            </button>
            <button type="button" className="px-3 py-2 rounded-lg border border-red-200 text-red-600 inline-flex items-center gap-1.5 text-sm font-semibold hover:bg-red-50 transition-all duration-200 ease-out active:scale-[0.98]">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Destinations</p>
              <p className="text-2xl font-bold mt-1.5">12</p>
            </div>
            <MapPin size={20} className="text-primary" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold mt-1.5">458</p>
            </div>
            <BookCheck size={20} className="text-primary" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold mt-1.5">$84,200</p>
            </div>
            <BadgeDollarSign size={20} className="text-primary" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Average Rating</p>
              <p className="text-2xl font-bold mt-1.5">4.8<span className="text-sm text-slate-400">/5</span></p>
            </div>
            <Star size={20} className="text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card border border-slate-200 dark:border-slate-800 p-4 md:p-5 space-y-4">
            <h3 className="text-lg md:text-xl font-bold">Business Information</h3>

            <div className="space-y-3.5">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Business Name</p>
                <p className="text-sm md:text-base font-semibold mt-1">Blue Horizon Villa Resorts</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Owner Name</p>
                <p className="text-sm md:text-base font-semibold mt-1">Marcus Aurelius Chen</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Contact Email</p>
                <a href="mailto:contact@bluehorizon.com" className="text-sm md:text-base text-primary underline mt-1 inline-block">
                  contact@bluehorizon.com
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Phone Number</p>
                <p className="text-sm md:text-base font-semibold mt-1">+1 (555) 092-4822</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Address</p>
                <p className="text-sm md:text-base font-semibold mt-1">
                  122 Coastal Way, Sunset Beach, CA 90210, United States
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Website</p>
                <a href="https://www.bluehorizonvilla.com" target="_blank" rel="noreferrer" className="text-sm md:text-base text-primary underline mt-1 inline-block">
                  www.bluehorizonvilla.com
                </a>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 card border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold">Managed Destinations</h3>
              <button type="button" className="text-sm text-primary font-semibold hover:underline transition-all duration-200 ease-out active:scale-[0.98]">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 md:px-5 py-3">Destination</th>
                    <th className="px-4 md:px-5 py-3">Base Price</th>
                    <th className="px-4 md:px-5 py-3">Status</th>
                    <th className="px-4 md:px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {destinations.map((destination, idx) => (
                    <tr key={idx} className="table-row transition-colors duration-150">
                      <td className="px-4 md:px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={destination.image} alt={destination.name} className="w-10 h-10 rounded-md object-cover" />
                          <span className="text-sm md:text-base font-semibold">{destination.name}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3 text-sm md:text-base font-medium">{destination.price}</td>
                      <td className="px-4 md:px-5 py-3">
                        <span className={destination.status === 'Available' ? 'px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase' : 'px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 uppercase'}>
                          {destination.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 py-3 text-right">
                        <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 ease-out active:scale-95">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="py-3 text-center border-t border-slate-200 dark:border-slate-800">
              <button type="button" className="text-sm text-slate-500 hover:text-primary font-medium transition-all duration-200 ease-out active:scale-[0.98]">
                Load 8 More Destinations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
