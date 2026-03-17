import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Coffee,
  Tv,
  Wind,
  Dumbbell,
  Utensils,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Eye
} from 'lucide-react';

const PropertyDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property;

  // Sample room data - in real app this would come from API or state
  const defaultRooms = [
    {
      id: '1',
      name: 'Deluxe Ocean View Suite',
      type: 'Suite',
      price: 280,
      max_capacity: 4,
      room_number: '501',
      room_floor: '5',
      beds: '2 King Beds',
      baths: 2,
      size: '45 sqm',
      description: 'Spacious suite with ocean view and private balcony.',
      amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Ocean View'],
      image: 'https://picsum.photos/seed/room1/400/300',
      available: true
    },
    {
      id: '2',
      name: 'Premium Twin Room',
      type: 'Standard',
      price: 120,
      max_capacity: 2,
      room_number: '208',
      room_floor: '2',
      beds: '2 Twin Beds',
      baths: 1,
      size: '28 sqm',
      description: 'Comfortable twin room with modern amenities.',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk'],
      image: 'https://picsum.photos/seed/room2/400/300',
      available: true
    },
    {
      id: '3',
      name: 'Family Garden View Room',
      type: 'Family',
      price: 180,
      max_capacity: 6,
      room_number: '312',
      room_floor: '3',
      beds: '1 Queen Bed, 2 Twin Beds',
      baths: 2,
      size: '55 sqm',
      description: 'Family-friendly room with garden view and extra space.',
      amenities: ['WiFi', 'Air Conditioning', 'Kitchenette', 'Garden View', 'Sofa Bed'],
      image: 'https://picsum.photos/seed/room3/400/300',
      available: false
    },
    {
      id: '4',
      name: 'Business Executive Room',
      type: 'Business',
      price: 150,
      max_capacity: 2,
      room_number: '410',
      room_floor: '4',
      beds: '1 King Bed',
      baths: 1,
      size: '32 sqm',
      description: 'Executive room with work desk and lounge access.',
      amenities: ['WiFi', 'Work Desk', 'Executive Lounge Access', 'Coffee Machine'],
      image: 'https://picsum.photos/seed/room4/400/300',
      available: true
    },
    {
      id: '5',
      name: 'Honeymoon Suite',
      type: 'Suite',
      price: 350,
      max_capacity: 2,
      room_number: '601',
      room_floor: '6',
      beds: '1 King Bed',
      baths: 1,
      size: '40 sqm',
      description: 'Romantic suite with jacuzzi and city view.',
      amenities: ['WiFi', 'Jacuzzi', 'Champagne Bar', 'City View', 'Romantic Decor'],
      image: 'https://picsum.photos/seed/room5/400/300',
      available: true
    },
    {
      id: '6',
      name: 'Budget Single Room',
      type: 'Budget',
      price: 65,
      max_capacity: 1,
      room_number: '105',
      room_floor: '1',
      beds: '1 Single Bed',
      baths: 1,
      size: '18 sqm',
      description: 'Simple and affordable room for solo travelers.',
      amenities: ['WiFi', 'Shared Bathroom', 'Basic Amenities'],
      image: 'https://picsum.photos/seed/room6/400/300',
      available: true
    }
  ];

  const [rooms, setRooms] = React.useState<any[]>(defaultRooms);
  const [selectedRoom, setSelectedRoom] = React.useState<any | null>(null);
  const [showRoomModal, setShowRoomModal] = React.useState(false);

  React.useEffect(() => {
    if (!property?.id) return;
    const storedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const propertyRooms = storedRooms.filter((r: any) => r.propertyId === property.id);
    if (propertyRooms.length > 0) {
      setRooms(propertyRooms);
    } else {
      setRooms(defaultRooms);
    }
  }, [property?.id]);

  const handleDeleteRoom = (room: any) => {
    if (!property?.id) return;
    const ok = window.confirm(`Delete room "${room?.name || ''}"?`);
    if (!ok) return;

    const storedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const updatedRooms = storedRooms.filter((r: any) => r.id !== room.id);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));

    const propertyRooms = updatedRooms.filter((r: any) => r.propertyId === property.id);
    setRooms(propertyRooms.length > 0 ? propertyRooms : defaultRooms);
  };

  const handleViewRoom = (room: any) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property not found</h2>
          <button
            onClick={() => navigate('/destinations')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Destinations
          </button>
        </div>
      </div>
    );
  }

  const propertyAmenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Car, name: 'Free Parking' },
    { icon: Coffee, name: 'Restaurant' },
    { icon: Tv, name: 'TV Lounge' },
    { icon: Wind, name: 'Air Conditioning' },
    { icon: Dumbbell, name: 'Fitness Center' },
    { icon: Utensils, name: 'Kitchen' },
  ];

  const safeText = (value: any) => {
    if (value === null || value === undefined) return '-';
    const s = String(value).trim();
    return s.length > 0 ? s : '-';
  };

  const inferred = (() => {
    const rawLocation = typeof property.location === 'string' ? property.location : '';
    const parts = rawLocation.split(',').map((p: string) => p.trim()).filter(Boolean);
    const city = safeText(property.city ?? parts[0]);
    const country = safeText(property.country ?? parts[1]);
    return { city, country };
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/destinations')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Destinations
            </button>
            
          </div>
        </div>
      </div>

      {/* Property Hero Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Images */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>
                <img 
                  src="https://picsum.photos/seed/prop1/400/300" 
                  alt="Property view 2"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <img 
                  src="https://picsum.photos/seed/prop2/400/300" 
                  alt="Property view 3"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    property.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {property.status === 'active' ? 'ACTIVE' : 'DRAFT'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin size={16} className="mr-1" />
                  {property.location}
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-1" size={20} />
                    <span className="font-semibold text-gray-900 dark:text-white">{property.rating || 'N/A'}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">rating</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="text-blue-600 mr-1" size={20} />
                    <span className="font-semibold text-gray-900 dark:text-white">{property.totalBookings || 0}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">total bookings</span>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hotel Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">id</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.id)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">hotel_name</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.name)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">city</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{inferred.city}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">country</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{inferred.country}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">address</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.address ?? property.location)}</span>
                    </div>
                   
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">star_rating</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.star_rating ?? property.rating)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">is_active</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.is_active ?? (property.status === 'active'))}</span>
                    </div>

                   
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">description</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.description)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">create_at</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.create_at)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-400">update_at</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-right">{safeText(property.update_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {propertyAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <amenity.icon size={16} className="mr-2 text-blue-600" />
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Property Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Rooms</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{rooms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Available Rooms</span>
                    <span className="font-semibold text-green-600">{rooms.filter(r => r.available).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Starting Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${Math.min(...rooms.map(r => r.price))}/night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Rooms</h2>
          <button 
            onClick={() => navigate(`/destinations/${property.id}/add-room`, { state: { property } })}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add New Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
                {!room.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Not Available</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">${room.price}/night</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{room.name}</h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">Room number</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(room.room_number)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">Room floor</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(room.room_floor)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">Size</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(room.size)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">Max capacity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(room.max_capacity ?? room.capacity)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {safeText(room.description)}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(room.amenities || []).slice(0, 3).map((amenity: any, index: number) => (
                    <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {(room.amenities || []).length > 3 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      +{(room.amenities || []).length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewRoom(room)}
                    className={`flex-1 h-10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      room.available
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/destinations/${property.id}/add-room`, { state: { property, room } })}
                    className="h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center"
                    title="Edit room"
                    aria-label="Edit room"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="h-10 w-10 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center justify-center"
                    title="Delete room"
                    aria-label="Delete room"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{safeText(selectedRoom.name)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Room details</p>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img
                  src={selectedRoom.image}
                  alt={selectedRoom.name}
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Room number</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(selectedRoom.room_number)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Room floor</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(selectedRoom.room_floor)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Size</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(selectedRoom.size)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Max capacity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(selectedRoom.max_capacity ?? selectedRoom.capacity)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{safeText(selectedRoom.price)} / night</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{safeText(selectedRoom.description)}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end bg-white dark:bg-gray-900 sticky bottom-0">
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  navigate(`/destinations/${property.id}/add-room`, { state: { property, room: selectedRoom } });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Room
              </button>
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  handleDeleteRoom(selectedRoom);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
