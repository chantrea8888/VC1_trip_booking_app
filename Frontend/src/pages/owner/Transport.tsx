import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Bell, 
  Edit, 
  Trash2, 
  Clock,
  Plane,
  Bus,
  Train,
  Car
} from 'lucide-react';

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
  const [editing, setEditing] = React.useState<TransportService | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '',
    route: '',
    details: '',
    status: 'Active' as TransportService['status'],
    price_per_KM: ''
  });

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
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Traffic_in_Cambodia..JPG',
      price_per_KM: typeof v.price_per_KM === 'number' ? v.price_per_KM : (v.price_per_KM ? parseFloat(v.price_per_KM) : undefined)
    }));
  }, [vehicles]);

  const allServices = React.useMemo(() => {
    return [...services, ...storedVehicleServices];
  }, [services, storedVehicleServices]);

  const openEdit = (service: TransportService) => {
    setEditing(service);
    setEditForm({
      name: service.name,
      route: service.route,
      details: service.details,
      status: service.status,
      price_per_KM: typeof service.price_per_KM === 'number' ? service.price_per_KM.toString() : ''
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const saveEdit = () => {
    if (!editing) return;

    const parsedPrice = editForm.price_per_KM.trim() ? parseFloat(editForm.price_per_KM) : undefined;
    const updatedService: TransportService = {
      ...editing,
      name: editForm.name,
      route: editForm.route,
      details: editForm.details,
      status: editForm.status,
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
          updatedAt: new Date().toISOString()
        };
      });
      setVehicles(nextVehicles);
      localStorage.setItem('vehicles', JSON.stringify(nextVehicles));
      closeEdit();
      return;
    }

    setServices(prev => prev.map(s => (s.id === editing.id ? updatedService : s)));
    closeEdit();
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
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Transport Services</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of all transport services</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button
              onClick={() => navigate('/transport/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add New Transport
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Transport Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedServices.map((service) => {
            const TypeIcon = getTypeIcon(service.type);
            return (
              <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                    {service.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock size={14} className="mr-1" />
                      {service.route}
                    </div>
                  </div>
                  {typeof service.price_per_KM === 'number' && (
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      ${service.price_per_KM.toFixed(2)} / km
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">{service.details}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteService(service)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Clock size={16} />
                      </button>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
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
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredServices.length)} of {filteredServices.length} transport services
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
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
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Transport</h3>
              <button onClick={closeEdit} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Route</label>
                <input
                  value={editForm.route}
                  onChange={(e) => setEditForm({ ...editForm, route: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Details</label>
                <input
                  value={editForm.details}
                  onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TransportService['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Price per KM</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price_per_KM}
                    onChange={(e) => setEditForm({ ...editForm, price_per_KM: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1.50"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;
