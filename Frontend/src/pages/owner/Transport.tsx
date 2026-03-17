import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Bell, 
  Edit, 
  Trash2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Plane,
  Bus,
  Train,
  Car
} from 'lucide-react';
import { NotificationDropdown, type AdminNotification } from '../../components/common/NotificationDropdown';
import { cn } from '../../utils/utils';

interface TransportService {
  id: string;
  name: string;
  type: 'Flight' | 'Bus' | 'Train' | 'Car Rental';
  status: 'Active' | 'Maintenance' | 'Inactive';
  route: string;
  details: string;
  image: string;
  price_per_KM?: number;
}

const Transport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = React.useState(true);
  const [viewing, setViewing] = React.useState<TransportService | null>(null);
  const [editing, setEditing] = React.useState<TransportService | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '',
    type: 'Car Rental' as TransportService['type'],
    route: '',
    details: '',
    status: 'Active' as TransportService['status'],
    price_per_KM: '',
    image: ''
  });

  const editPhotoInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('ownerTransportHasUnreadNotifications');
    if (saved === 'false') {
      setHasUnreadNotifications(false);
    }
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setHasUnreadNotifications(false);
        localStorage.setItem('ownerTransportHasUnreadNotifications', 'false');
      }
      return next;
    });
  };

  const activeTransportPromotion = React.useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ownerPromotions') || '[]');
      const promos = Array.isArray(stored) ? stored : [];
      const active = promos.filter(
        (p: any) => p?.serviceCategory === 'transport' && (p?.status === 'active' || !p?.status),
      );
      return active.length > 0 ? active[0] : null;
    } catch {
      return null;
    }
  }, []);

  const computeDiscountedPrice = (basePrice?: number) => {
    if (typeof basePrice !== 'number') return { finalPrice: undefined as number | undefined, hasDiscount: false };
    const discount = typeof activeTransportPromotion?.discount === 'string' ? activeTransportPromotion.discount : '';
    if (!discount) return { finalPrice: basePrice, hasDiscount: false };

    const trimmed = discount.trim();
    if (trimmed.endsWith('%')) {
      const pct = parseFloat(trimmed.replace('%', ''));
      if (!Number.isFinite(pct)) return { finalPrice: basePrice, hasDiscount: false };
      const finalPrice = Math.max(0, basePrice - basePrice * (pct / 100));
      return { finalPrice, hasDiscount: true };
    }

    if (trimmed.startsWith('$')) {
      const amt = parseFloat(trimmed.replace('$', ''));
      if (!Number.isFinite(amt)) return { finalPrice: basePrice, hasDiscount: false };
      const finalPrice = Math.max(0, basePrice - amt);
      return { finalPrice, hasDiscount: true };
    }

    return { finalPrice: basePrice, hasDiscount: false };
  };

  const transportNotifications: AdminNotification[] = [
    {
      id: 'transport-1',
      title: 'New transport booking',
      description: 'A customer booked “Shared Shuttle • PP — Siem Reap”.',
      time: '5 mins ago',
      type: 'booking',
      read: false,
    },
    {
      id: 'transport-2',
      title: 'Route timing question',
      description: 'New message about pickup time for “Private SUV • PP — Kampot”.',
      time: '1 hour ago',
      type: 'system',
      read: true,
    },
    {
      id: 'transport-3',
      title: 'Maintenance reminder',
      description: 'Vehicle “Premium Van (PP)” is due for scheduled maintenance.',
      time: 'Yesterday',
      type: 'alert',
      read: true,
    },
  ];

  const initialTransportServices: TransportService[] = [
    {
      id: '1',
      name: 'Phnom Penh Airport Shuttle',
      type: 'Flight',
      status: 'Active',
      route: 'Phnom Penh (PNH) -> Siem Reap (REP)',
      details: 'Daily • Airport connections • Checked baggage',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Phnom_penh_airport.JPG',
      price_per_KM: 2.5
    },
    {
      id: '2',
      name: 'Siem Reap Regional Flights',
      type: 'Flight',
      status: 'Active',
      route: 'Phnom Penh (PNH) -> Siem Reap (REP)',
      details: 'Multiple departures • Fast check-in • On-time focus',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Phnom_penh_airport.JPG',
      price_per_KM: 2.2
    },
    {
      id: '3',
      name: 'Phnom Penh City Bus',
      type: 'Bus',
      status: 'Active',
      route: 'Phnom Penh (Central) -> Night Market (Sisowath Quay)',
      details: 'Frequent service • Air-conditioned • Cashless options',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Buses_lined_up_near_Phnom_Penh_BRT_Night_Market_terminus_station_on_Sisowath_Quay.jpg',
      price_per_KM: 0.35
    },
    {
      id: '4',
      name: 'Royal Railway (Phnom Penh)',
      type: 'Train',
      status: 'Maintenance',
      route: 'Phnom Penh Station -> Battambang Station',
      details: 'Limited schedule • Station services • Seat reservations',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Phnom_Penh_sta.%2Cphnom_penh_city%2Ccambodia.JPG',
      price_per_KM: 0.18
    },
    {
      id: '5',
      name: 'Battambang Railway Services',
      type: 'Car Rental',
      status: 'Active',
      route: 'Battambang -> Phnom Penh',
      details: 'Pickup options • Licensed drivers • Flexible timing',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Battambang_Royal_Railway-Station%2C_Cambodia.jpg',
      price_per_KM: 0.95
    },
    {
      id: '6',
      name: 'Tuk-tuk & City Rides',
      type: 'Car Rental',
      status: 'Active',
      route: 'Phnom Penh (Riverside) -> Independence Monument',
      details: 'On-demand • Local knowledge • Short city trips',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tuk-tuk_in_Phnom_Penh.jpg',
      price_per_KM: 0.8
    },
    {
      id: '7',
      name: 'Phnom Penh BRT Line',
      type: 'Bus',
      status: 'Active',
      route: 'Monivong–Sihanouk Station -> City Center',
      details: 'Regular service • Ticket on board • Daily operations',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Phnom_Penh_BRT_bus_leaves_Monivong-Sihanouk_station.jpg',
      price_per_KM: 0.4
    },
    {
      id: '8',
      name: 'Private Car & Airport Transfer',
      type: 'Car Rental',
      status: 'Active',
      route: 'Phnom Penh (PNH) -> City Hotels',
      details: 'Meet & greet • Fixed pricing • Luggage support',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Traffic_in_Cambodia..JPG',
      price_per_KM: 1.2
    }
  ];

  const [services, setServices] = React.useState<TransportService[]>(initialTransportServices);
  const [customServices, setCustomServices] = React.useState<TransportService[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('transportServices') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [vehicles, setVehicles] = React.useState<any[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('vehicles') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const storedVehicleServices: TransportService[] = React.useMemo(() => {
    return vehicles.map((v: any) => ({
      id: `vehicle-${v.id ?? Date.now().toString()}`,
      name: v.makeModel ? `${v.makeModel} (${v.plateNumber || 'No plate'})` : (v.plateNumber || 'Vehicle'),
      type: 'Car Rental',
      status: 'Active',
      route: 'Phnom Penh',
      details: v.vehicleType || 'Vehicle',
      image: typeof v.image === 'string' && v.image.trim().length > 0 ? v.image : 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Traffic_in_Cambodia..JPG',
      price_per_KM: typeof v.price_per_KM === 'number' ? v.price_per_KM : (v.price_per_KM ? parseFloat(v.price_per_KM) : undefined)
    }));
  }, [vehicles]);

  const allServices = React.useMemo(() => {
    return [...services, ...customServices, ...storedVehicleServices];
  }, [services, customServices, storedVehicleServices]);

  const openEdit = (service: TransportService) => {
    setEditing(service);
    setEditForm({
      name: service.name,
      type: service.type,
      route: service.route,
      details: service.details,
      status: service.status,
      price_per_KM: typeof service.price_per_KM === 'number' ? service.price_per_KM.toString() : '',
      image: service.image || ''
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const openDetails = (service: TransportService) => {
    setViewing(service);
  };

  const closeDetails = () => {
    setViewing(null);
  };

  const saveEdit = () => {
    if (!editing) return;

    const parsedPrice = editForm.price_per_KM.trim() ? parseFloat(editForm.price_per_KM) : undefined;
    const updatedService: TransportService = {
      ...editing,
      name: editForm.name,
      type: editForm.type,
      route: editForm.route,
      details: editForm.details,
      status: editForm.status,
      image: editForm.image,
      price_per_KM: typeof parsedPrice === 'number' && !Number.isNaN(parsedPrice) ? parsedPrice : undefined
    };

    if (editing.id.startsWith('vehicle-')) {
      const originalVehicleId = editing.id.replace('vehicle-', '');
      const nextVehicles = vehicles.map((v: any) => {
        if (String(v.id) !== String(originalVehicleId)) return v;
        return {
          ...v,
          price_per_KM: updatedService.price_per_KM,
          vehicleType: updatedService.details,
          image: updatedService.image,
          updatedAt: new Date().toISOString()
        };
      });
      setVehicles(nextVehicles);
      localStorage.setItem('vehicles', JSON.stringify(nextVehicles));
      closeEdit();
      return;
    }

    if (customServices.some((s) => s.id === editing.id)) {
      const nextCustom = customServices.map((s) => (s.id === editing.id ? updatedService : s));
      setCustomServices(nextCustom);
      localStorage.setItem('transportServices', JSON.stringify(nextCustom));
      closeEdit();
      return;
    }

    setServices(prev => prev.map(s => (s.id === editing.id ? updatedService : s)));
    closeEdit();
  };

  const onPickEditPhoto = () => {
    editPhotoInputRef.current?.click();
  };

  const onEditPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setEditForm((prev) => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteService = (service: TransportService) => {
    if (!window.confirm('Delete this transport item?')) return;

    if (service.id.startsWith('vehicle-')) {
      const originalVehicleId = service.id.replace('vehicle-', '');
      const nextVehicles = vehicles.filter((v: any) => String(v.id) !== String(originalVehicleId));
      setVehicles(nextVehicles);
      localStorage.setItem('vehicles', JSON.stringify(nextVehicles));
      return;
    }

    if (customServices.some((s) => s.id === service.id)) {
      const nextCustom = customServices.filter((s) => s.id !== service.id);
      setCustomServices(nextCustom);
      localStorage.setItem('transportServices', JSON.stringify(nextCustom));
      return;
    }

    setServices(prev => prev.filter(s => s.id !== service.id));
  };

  const tabs = [
    { id: 'all', label: 'All Services', count: 42 },
    { id: 'flights', label: 'Flights', count: 15 },
    { id: 'buses', label: 'Buses', count: 12 },
    { id: 'trains', label: 'Trains', count: 8 },
    { id: 'car-rentals', label: 'Car Rentals', count: 7 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Flight': return Plane;
      case 'Bus': return Bus;
      case 'Train': return Train;
      case 'Car Rental': return Car;
      default: return Plane;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Flight': return 'bg-blue-100 text-blue-600';
      case 'Bus': return 'bg-green-100 text-green-600';
      case 'Train': return 'bg-purple-100 text-purple-600';
      case 'Car Rental': return 'bg-orange-100 text-orange-600';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'flights' && service.type === 'Flight') ||
                      (activeTab === 'buses' && service.type === 'Bus') ||
                      (activeTab === 'trains' && service.type === 'Train') ||
                      (activeTab === 'car-rentals' && service.type === 'Car Rental');
    return matchesSearch && matchesTab;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, allServices.length]);

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  const getPageItems = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const items: Array<number | '...'> = [];
    const add = (v: number | '...') => items.push(v);

    add(1);

    const left = Math.max(2, safeCurrentPage - 1);
    const right = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (left > 2) add('...');
    for (let p = left; p <= right; p++) add(p);
    if (right < totalPages - 1) add('...');

    add(totalPages);
    return items;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Manage Transport Services</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of all transport services</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => navigate('/transport/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add New Transport
            </button>
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 relative"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={transportNotifications}
                onNotificationClick={() => setIsNotificationsOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 rounded-2xl">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Transport Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedServices.map((service) => {
            const TypeIcon = getTypeIcon(service.type);
            const { finalPrice, hasDiscount } = computeDiscountedPrice(service.price_per_KM);
            return (
              <div key={service.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                    {service.type}
                  </div>
                  {activeTransportPromotion?.discount && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {activeTransportPromotion.discount}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{service.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Clock size={14} className="mr-1" />
                      {service.route}
                    </div>
                  </div>
                  {typeof service.price_per_KM === 'number' && (
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through mr-2">${service.price_per_KM.toFixed(2)}</span>
                      )}
                      ${(finalPrice ?? service.price_per_KM).toFixed(2)} / km
                    </div>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{service.details}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteService(service)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => openDetails(service)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="View transport details"
                      >
                        <Clock size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => openDetails(service)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredServices.length)} of {filteredServices.length} transport services
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {getPageItems().map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 inline-flex items-center justify-center text-xs font-bold text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={
                      page === safeCurrentPage
                        ? 'w-8 h-8 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'w-8 h-8 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                    aria-label={`Page ${page}`}
                    aria-current={page === safeCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/transport/new')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <Plus size={24} />
      </button>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg max-h-[85vh] rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Transport</h3>
              <button onClick={closeEdit} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Photo</label>
                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onEditPhotoSelected}
                />
                <button
                  type="button"
                  onClick={onPickEditPhoto}
                  className="w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  {editForm.image ? (
                    <img alt="Transport" src={editForm.image} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Upload Photo</span>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Route</label>
                <input
                  value={editForm.route}
                  onChange={(e) => setEditForm({ ...editForm, route: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Details</label>
                <input
                  value={editForm.details}
                  onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransportService['type'] })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Flight">Flight</option>
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Car Rental">Car Rental</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TransportService['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Price per KM</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price_per_KM}
                    onChange={(e) => setEditForm({ ...editForm, price_per_KM: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1.50"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Transport Details</h3>
              <button onClick={closeDetails} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <img alt={viewing.name} src={viewing.image} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{viewing.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{viewing.route}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", getTypeColor(viewing.type))}>
                      {viewing.type}
                    </span>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", getStatusColor(viewing.status))}>
                      {viewing.status}
                    </span>
                  </div>

                  {typeof viewing.price_per_KM === 'number' && (
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ${viewing.price_per_KM.toFixed(2)} / km
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Details</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{viewing.details}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeDetails();
                    openEdit(viewing);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;
