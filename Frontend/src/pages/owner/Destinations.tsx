import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Star, MapPin, Edit, Trash2, X } from 'lucide-react';

const PropertyCard = ({ property, navigate, onDelete }: any) => (
  <div 
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
    onClick={() => navigate(`/destinations/${property.id}`, { state: { property } })}
  >
    <div className="relative">
      <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
      <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${
        property.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
      }`}>
        {property.status === 'active' ? 'ACTIVE' : 'DRAFT'}
      </div>
      <div className="absolute top-2 right-2 flex space-x-2">
        <button 
          className="p-2 rounded-full bg-white bg-opacity-75 text-gray-700 hover:bg-opacity-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from firing
            navigate(`/destinations/edit/${property.id}`, { state: { property } });
          }}
          title="Edit Property"
        >
          <Edit size={18} />
        </button>
        <button 
          className="p-2 rounded-full bg-white bg-opacity-75 text-red-600 hover:bg-opacity-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from firing
            onDelete(property);
          }}
          title="Delete Property"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{property.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-4">
        <Star className="text-yellow-500 mr-1" size={14} /> 
        {property.rating > 0 ? property.rating : 'N/A'}
        <span className="mx-2">•</span>
        <MapPin size={14} className="mr-1" />
        {property.location}
      </p>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{property.totalBookings || 0}</p>
        </div>
      </div>
    </div>
  </div>
);

const Destinations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [propertyToDelete, setPropertyToDelete] = React.useState<any>(null);
  const [properties, setProperties] = React.useState([
    { id: '1', name: 'Mekong Riverside Villa', location: 'Phnom Penh, Cambodia', price: 185, rating: 4.9, status: 'active', image: 'https://picsum.photos/seed/villa1/800/600', totalBookings: 24 },
    { id: '2', name: 'Koh Rong Luxury Retreat', location: 'Koh Rong, Sihanoukville', price: 340, rating: 4.8, status: 'active', image: 'https://picsum.photos/seed/villa2/800/600', totalBookings: 18 },
    { id: '3', name: 'Siem Reap Boutique Stay', location: 'Siem Reap City Center', price: 120, rating: 0, status: 'draft', image: 'https://picsum.photos/seed/villa3/800/600', totalBookings: 0 },
    { id: '4', name: 'Kampot Pepper Farm Villa', location: 'Kampot, Rural Area', price: 155, rating: 4.7, status: 'active', image: 'https://picsum.photos/seed/villa4/800/600', totalBookings: 12 },
    { id: '5', name: 'Mondulkiri Eco Lodge', location: 'Sen Monorom, Mondulkiri', price: 95, rating: 4.9, status: 'active', image: 'https://picsum.photos/seed/villa5/800/600', totalBookings: 31 },
    { id: '6', name: 'Cardamom Tented Camp', location: 'Koh Kong Forest', price: 210, rating: 0, status: 'draft', image: 'https://picsum.photos/seed/villa6/800/600', totalBookings: 0 },
  ]);

  React.useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    if (storedProperties.length > 0) {
      setProperties(prev => [...prev, ...storedProperties]);
    }
  }, []);

  const handleDelete = (property: any) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      // Remove from localStorage
      const storedProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      const updatedProperties = storedProperties.filter((p: any) => p.id !== propertyToDelete.id);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      // Remove from state
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Destinations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your property listings</p>
          </div>
          <button
            onClick={() => navigate('/destinations/new')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add New Destination
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({properties.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Active ({properties.filter(p => p.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'draft' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Draft ({properties.filter(p => p.status === 'draft').length})
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} navigate={navigate} onDelete={handleDelete} />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No destinations found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Property</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete "{propertyToDelete?.name}"? This will permanently remove the property and all associated data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Property
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
