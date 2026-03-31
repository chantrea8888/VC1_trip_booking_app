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
import { apiRequest } from '../../services/api';
import { getAuthToken } from '../../services/authService';

interface TransportService {
  id: string;
  name: string;
  type: 'Flight' | 'Bus' | 'Motobike' | 'Car Rental';
  status: 'Active' | 'Fixing' | 'Not working' | 'Waiting';
  route: string;
  details: string;
  image: string;
  price_per_KM?: number;
  is_free?: boolean;
}

const DEFAULT_TRANSPORT_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/a/a2/Traffic_in_Cambodia..JPG';

const resolveTransportImageUrl = (value: unknown): string => {
  const backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const rawValue = typeof value === 'string' ? value.trim() : '';

  if (!rawValue) {
    return DEFAULT_TRANSPORT_IMAGE;
  }

  let normalized = rawValue.replace(/\\/g, '/');

  if (/^https?:\/[^/]/i.test(normalized)) {
    normalized = normalized.replace(/^([a-z]+:)\/(?!\/)/i, '$1//');
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const relative = normalized.replace(/^\/+/, '');

  if (relative.startsWith('storage/')) {
    return `${backendOrigin}/${relative}`;
  }

  if (relative.startsWith('api/files/')) {
    return `${backendOrigin}/${relative}`;
  }

  if (relative.startsWith('public/')) {
    return `${backendOrigin}/storage/${relative.slice('public/'.length)}`;
  }

  if (relative.startsWith('uploads/') || relative.startsWith('images/')) {
    return `${backendOrigin}/storage/${relative}`;
  }

  return `${backendOrigin}/${relative}`;
};

const TransportCardImage = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) => (
  <img
    src={src || DEFAULT_TRANSPORT_IMAGE}
    alt={alt ?? 'Transport Image'}
    className={cn('w-full h-full object-cover', className)}
    loading="lazy"
  />
);

const Transport = () => {
  const navigate = useNavigate();
  const priceOptions = [
    { label: '$0.50', value: '0.50', isFree: false },
    { label: '$1', value: '1.00', isFree: false },
    { label: '$1.50', value: '1.50', isFree: false },
    { label: 'Free only', value: '0', isFree: true },
  ] as const;
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
    is_free: false,
    image: '',
    imageFile: null as File | null
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

  const [services, setServices] = React.useState<TransportService[]>([]);
  const [loadError, setLoadError] = React.useState('');
  const allServices = services;

  const transportNotifications: AdminNotification[] = [
    {
      id: 'transport-1',
      title: 'New transport booking',
      description: 'A customer booked “Shared Motobike • PP — Siem Reap”.',
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

  const selectedEditPriceOption = React.useMemo(() => {
    if (editForm.is_free) return '0';
    const matched = priceOptions.find((option) => !option.isFree && Number(option.value) === Number(editForm.price_per_KM));
    return matched?.value ?? '';
  }, [editForm.is_free, editForm.price_per_KM]);

  const applyEditPriceOption = (value: string) => {
    const option = priceOptions.find((item) => item.value === value);
    if (!option) return;

    setEditForm((prev) => ({
      ...prev,
      is_free: option.isFree,
      price_per_KM: option.isFree ? '0' : option.value,
    }));
  };

  React.useEffect(() => {
    const loadOwnerTransports = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoadError('Please sign in to load your transport services.');
          return;
        }

        const transportsResponse = await apiRequest('/owner/transports', {
          headers: { Authorization: `Bearer ${token}` },
        }) as { data?: any[] };
        const mapped = (transportsResponse?.data ?? []).map((item: any) => {
          const rawType = String(item?.transport_type ?? 'Car Rental');
          const type = rawType === 'Shuttle' || rawType === 'Train' ? 'Motobike' : rawType === 'Other' ? 'Car Rental' : rawType;
          const rawStatus = String(item?.status ?? 'pending');
          const status =
            rawStatus === 'active'
              ? 'Active'
              : rawStatus === 'inactive'
                ? 'Not working'
                : rawStatus === 'maintenance'
                ? 'Fixing'
                : 'Waiting';
          const image = resolveTransportImageUrl(item?.vehicle_photo_url);
          return {
            id: String(item?.transport_id ?? item?.id ?? ''),
            name: String(item?.service_name ?? ''),
            type: (type as TransportService['type']) ?? 'Car Rental',
            status: (status as TransportService['status']) ?? 'Pending',
            route: String(item?.route_description ?? ''),
            details: String(item?.service_details ?? ''),
            image,
            price_per_KM: typeof item?.price_per_km === 'number'
              ? item.price_per_km
              : (item?.price_per_km ? parseFloat(item.price_per_km) : undefined),
            is_free: Boolean(item?.is_free ?? item?.isFree ?? false),
          };
        });

        setServices(mapped);
        setLoadError('');
      } catch (error: any) {
        const message = error?.data?.message ?? error?.message ?? 'Failed to load transports.';
        setLoadError(message);
      }
    };

    loadOwnerTransports();
  }, []);

  const openEdit = (service: TransportService) => {
    setEditing(service);
    setEditForm({
      name: service.name,
      type: service.type,
      route: service.route,
      details: service.details,
      status: service.status,
      price_per_KM: typeof service.price_per_KM === 'number' ? service.price_per_KM.toString() : '',
      is_free: Boolean(service.is_free),
      image: service.image || '',
      imageFile: null
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
    const finalPrice = editForm.is_free
      ? 0
      : (
          typeof parsedPrice === 'number' && !Number.isNaN(parsedPrice)
            ? parsedPrice
            : (typeof editing.price_per_KM === 'number' ? editing.price_per_KM : 0)
        );

    const token = getAuthToken();
    if (!token) {
      setLoadError('Please sign in to update a transport service.');
      return;
    }

    const statusMap: Record<TransportService['status'], 'active' | 'inactive' | 'pending'> = {
      Active: 'active',
      'Not working': 'inactive',
      Waiting: 'pending',
      Fixing: 'inactive',
    };

    const typeMap: Record<TransportService['type'], 'Car Rental' | 'Train' | 'Bus' | 'Other'> = {
      'Car Rental': 'Car Rental',
      Motobike: 'Other',
      Bus: 'Bus',
      Flight: 'Other',
    };

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('service_name', editForm.name);
    formData.append('transport_type', typeMap[editForm.type] ?? 'Car Rental');
    formData.append('price_per_km', finalPrice.toString());
    formData.append('is_free', editForm.is_free ? '1' : '0');
    formData.append('route_description', editForm.route);
    formData.append('service_details', editForm.details);
    formData.append('status', statusMap[editForm.status] ?? 'pending');
    if (editForm.imageFile) {
      formData.append('vehicle_photo', editForm.imageFile);
    }

    apiRequest(`/owner/transports/${editing.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response: any) => {
        const item = response?.data ?? response;
        const rawType = String(item?.transport_type ?? editForm.type ?? 'Car Rental');
        const type = rawType === 'Shuttle' || rawType === 'Train' ? 'Motobike' : rawType === 'Other' ? 'Car Rental' : rawType;
        const rawStatus = String(item?.status ?? statusMap[editForm.status] ?? 'pending');
        const status =
          rawStatus === 'active'
            ? 'Active'
            : rawStatus === 'inactive'
              ? 'Not working'
              : rawStatus === 'maintenance'
              ? 'Fixing'
              : 'Waiting';
        const image = resolveTransportImageUrl(item?.vehicle_photo_url ?? editForm.image);

        const updatedService: TransportService = {
          ...editing,
          name: String(item?.service_name ?? editForm.name),
          type: (type as TransportService['type']) ?? editForm.type,
          route: String(item?.route_description ?? editForm.route),
          details: String(item?.service_details ?? editForm.details),
          status: (status as TransportService['status']) ?? editForm.status,
          image,
          price_per_KM: typeof item?.price_per_km === 'number'
            ? item.price_per_km
            : (item?.price_per_km ? parseFloat(item.price_per_km) : finalPrice),
          is_free: Boolean(item?.is_free ?? editForm.is_free),
        };

        setServices(prev => prev.map(s => (s.id === editing.id ? updatedService : s)));
        closeEdit();
      })
      .catch((error: any) => {
        const message = error?.data?.message ?? error?.message ?? 'Failed to update transport.';
        setLoadError(message);
      });
  };

  const onPickEditPhoto = () => {
    editPhotoInputRef.current?.click();
  };

  const onEditPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    if (editForm.image && editForm.image.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(editForm.image);
      } catch {
        // ignore revoke errors
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setEditForm((prev) => ({ ...prev, image: result }));
      }
    };
    const previewUrl = URL.createObjectURL(file);
    setEditForm((prev) => ({ ...prev, image: previewUrl, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const deleteService = (service: TransportService) => {
    if (!window.confirm('Delete this transport item?')) return;

    const token = getAuthToken();
    if (!token) {
      setLoadError('Please sign in to delete a transport service.');
      return;
    }

    const snapshot = services;
    setServices(prev => prev.filter(s => s.id !== service.id));

    apiRequest(`/owner/transports/${service.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((error: any) => {
      const message = error?.data?.message ?? error?.message ?? 'Failed to delete transport.';
      setServices(snapshot);
      setLoadError(message);
    });
  };

  const tabCounts = React.useMemo(() => {
    const counts = {
      all: allServices.length,
      flights: 0,
      buses: 0,
      motobikes: 0,
      'car-rentals': 0,
    };

    allServices.forEach((service) => {
      switch (service.type) {
        case 'Flight':
          counts.flights += 1;
          break;
        case 'Bus':
          counts.buses += 1;
          break;
        case 'Motobike':
          counts.motobikes += 1;
          break;
        case 'Car Rental':
          counts['car-rentals'] += 1;
          break;
        default:
          break;
      }
    });
    return counts;
  }, [allServices]);

  const tabs = [
    { id: 'all', label: 'All Services', count: tabCounts.all },
    { id: 'flights', label: 'Flights', count: tabCounts.flights },
    { id: 'buses', label: 'Buses', count: tabCounts.buses },
    { id: 'motobikes', label: 'Motobikes', count: tabCounts.motobikes },
    { id: 'car-rentals', label: 'Car Rentals', count: tabCounts['car-rentals'] }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Flight': return Plane;
      case 'Bus': return Bus;
      case 'Motobike': return Car;
      case 'Car Rental': return Car;
      default: return Plane;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Flight': return 'bg-blue-100 text-blue-600';
      case 'Bus': return 'bg-green-100 text-green-600';
      case 'Motobike': return 'bg-purple-100 text-purple-600';
      case 'Car Rental': return 'bg-orange-100 text-orange-600';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Fixing': return 'bg-yellow-100 text-yellow-800';
      case 'Not working': return 'bg-red-100 text-red-800';
      case 'Waiting': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'flights' && service.type === 'Flight') ||
                      (activeTab === 'buses' && service.type === 'Bus') ||
                      (activeTab === 'motobikes' && service.type === 'Motobike') ||
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
        {loadError && (
          <div className="mb-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {loadError}
          </div>
        )}
        {/* Transport Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedServices.map((service) => {
            const TypeIcon = getTypeIcon(service.type);
            return (
              <div key={service.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <TransportCardImage
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                    {service.type}
                  </div>
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
                  {service.is_free ? (
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Free</div>
                  ) : typeof service.price_per_KM === 'number' && (
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      ${service.price_per_KM.toFixed(2)} / km
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
                    <option value="Motobike">Motobike</option>
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
                    <option value="Fixing">Fixing</option>
                    <option value="Not working">Not working</option>
                    <option value="Waiting">Waiting</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Price per day</label>
                  <div className="grid grid-cols-2 gap-3">
                    {priceOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-3 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                          selectedEditPriceOption === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEditPriceOption === option.value}
                          onChange={() => applyEditPriceOption(option.value)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
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
                  <TransportCardImage
                    alt={viewing.name}
                    src={viewing.image}
                    className="w-full h-full object-cover"
                  />
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

                  {viewing.is_free ? (
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Free</div>
                  ) : typeof viewing.price_per_KM === 'number' && (
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
