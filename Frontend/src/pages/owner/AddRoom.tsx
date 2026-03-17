import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Image as ImageIcon,
  DollarSign,
  Bed,
  Bath,
  Users,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Car,
  Dumbbell,
  Utensils,
  Minus,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/src/utils/utils';

const AddRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property;
  const roomToEdit = location.state?.room;
  const [step, setStep] = React.useState(1);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    type: 'Standard',
    price: '',
    capacity: '',
    room_number: '',
    room_floor: '',
    max_capacity: '',
    beds: '',
    baths: '',
    size: '',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
    available: true,
    propertyId: property?.id || ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const roomTypes = [
    'Standard', 'Deluxe', 'Suite', 'Family', 'Business', 'Budget', 'Premium', 'Executive'
  ];

  const bedOptions = [
    '1 Single Bed', '2 Single Beds', '1 Double Bed', '1 Queen Bed', '1 King Bed', 
    '2 Double Beds', '2 Queen Beds', '2 King Beds', '1 Queen Bed + 1 Single Bed',
    '1 King Bed + 2 Twin Beds', 'Bunk Beds', 'Sofa Bed'
  ];

  const amenityOptions = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Tv, name: 'TV/Cable' },
    { icon: Wind, name: 'Air Conditioning' },
    { icon: Coffee, name: 'Coffee/Tea Maker' },
    { icon: Utensils, name: 'Mini Bar/Kitchenette' },
    { icon: Car, name: 'Free Parking' },
    { icon: Dumbbell, name: 'Gym Access' },
    { icon: Bath, name: 'Private Bathroom' },
    { icon: Users, name: 'Living Area' },
    { icon: Bed, name: 'Balcony/Terrace' },
    { icon: Tv, name: 'Smart TV' },
    { icon: Coffee, name: 'Refrigerator' },
    { icon: Wind, name: 'Heating' },
    { icon: Utensils, name: 'Microwave' },
    { icon: Users, name: 'Work Desk' },
    { icon: Bath, name: 'Bathtub' },
    { icon: Bed, name: 'King Size Bed' },
    { icon: Tv, name: 'Streaming Services' },
    { icon: Coffee, name: 'Electric Kettle' },
    { icon: Wind, name: 'Ceiling Fan' }
  ];

  const steps = [
    { id: 1, label: 'Basic Info', icon: Info },
    { id: 2, label: 'Media', icon: ImageIcon },
    { id: 3, label: 'Amenities', icon: CheckCircle2 },
    { id: 4, label: 'Review', icon: CheckCircle2 },
  ];

  React.useEffect(() => {
    if (!roomToEdit) return;
    setFormData(prev => ({
      ...prev,
      name: roomToEdit.name || '',
      type: roomToEdit.type || 'Standard',
      price: roomToEdit.price?.toString?.() || '',
      capacity: (roomToEdit.capacity ?? roomToEdit.max_capacity ?? '')?.toString?.() || '',
      max_capacity: (roomToEdit.max_capacity ?? roomToEdit.capacity ?? '')?.toString?.() || '',
      room_number: roomToEdit.room_number || '',
      room_floor: roomToEdit.room_floor || '',
      beds: roomToEdit.beds || '',
      baths: roomToEdit.baths?.toString?.() || '',
      size: roomToEdit.size || '',
      description: roomToEdit.description || '',
      amenities: roomToEdit.amenities || [],
      images: roomToEdit.images || (roomToEdit.image ? [roomToEdit.image] : []),
      available: roomToEdit.available ?? true,
      propertyId: roomToEdit.propertyId || property?.id || prev.propertyId,
    }));
  }, [roomToEdit, property?.id]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Room name is required';
      if (!formData.type) newErrors.type = 'Room type is required';
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Valid price is required';
      }
      const capValue = formData.max_capacity || formData.capacity;
      if (!capValue || parseInt(capValue) <= 0) {
        newErrors.capacity = 'Valid capacity is required';
      }
      if (!formData.beds) newErrors.beds = 'Bed configuration is required';
      if (!formData.baths || parseInt(formData.baths) <= 0) {
        newErrors.baths = 'Valid number of bathrooms is required';
      }
      if (!formData.size.trim()) newErrors.size = 'Room size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStep(4)) return;

    const normalizedMaxCapacity = formData.max_capacity || formData.capacity;
    const newRoom = {
      id: roomToEdit?.id || Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(normalizedMaxCapacity),
      max_capacity: parseInt(normalizedMaxCapacity),
      baths: parseInt(formData.baths),
      propertyId: property?.id || ''
    };

    // Save to localStorage (in real app, this would be an API call)
    const existingRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const updatedRooms = roomToEdit
      ? existingRooms.map((r: any) => (r.id === roomToEdit.id ? { ...r, ...newRoom } : r))
      : [...existingRooms, newRoom];
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));

    // Navigate back to property detail
    navigate(`/destinations/${property?.id}`, { state: { property } });
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addImage = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files.length > 0) {
      // Handle actual file upload
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, event.target?.result as string]
              }));
            }
          };
          reader.readAsDataURL(file);
        }
      });
    } else {
      // Simulate adding an image (for demo purposes)
      const newImage = `https://picsum.photos/seed/room${Date.now()}/400/300`;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file: File) => file.type.startsWith('image/'));
    
    imageFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, event.target?.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
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

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`/destinations/${property.id}`, { state: { property } })}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{roomToEdit ? 'Edit Room' : 'Add New Room'}</h3>
          <p className="text-sm text-slate-500 mt-1">{roomToEdit ? `Update room in ${property.name}` : `Add a new room to ${property.name}`}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                step >= s.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider hidden sm:block",
                step >= s.id ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={16} className="text-slate-300 hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Name</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.name && "border-red-500"
                    )} 
                    placeholder="e.g. Deluxe Ocean View Suite" 
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per Night (USD)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.price && "border-red-500"
                    )} 
                    placeholder="150" 
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium resize-none" 
                    placeholder="Describe the room features and highlights..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Capacity</label>
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-blue-600" />
                    <input 
                      type="number"
                      value={formData.max_capacity || formData.capacity}
                      onChange={(e) => setFormData({...formData, max_capacity: e.target.value, capacity: e.target.value})}
                      className={cn(
                        "flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                        errors.capacity && "border-red-500"
                      )} 
                      placeholder="2" 
                    />
                    <span className="text-sm text-slate-500">guests</span>
                  </div>
                  {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Number</label>
                    <input 
                      value={formData.room_number}
                      onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" 
                      placeholder="e.g. 302" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Floor</label>
                    <input 
                      value={formData.room_floor}
                      onChange={(e) => setFormData({...formData, room_floor: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" 
                      placeholder="e.g. 3" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Bed Configuration</label>
                  <select 
                    value={formData.beds}
                    onChange={(e) => setFormData({...formData, beds: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option value="">Select bed type</option>
                    {bedOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.beds && <p className="text-xs text-red-500 mt-1">{errors.beds}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Bathrooms</label>
                  <div className="flex items-center gap-3">
                    <Bath size={20} className="text-blue-600" />
                    <input 
                      type="number"
                      value={formData.baths}
                      onChange={(e) => setFormData({...formData, baths: e.target.value})}
                      className={cn(
                        "flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                        errors.baths && "border-red-500"
                      )} 
                      placeholder="1" 
                    />
                  </div>
                  {errors.baths && <p className="text-xs text-red-500 mt-1">{errors.baths}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Size</label>
                  <input 
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.size && "border-red-500"
                    )} 
                    placeholder="e.g. 35 sqm" 
                  />
                  {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Availability</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Room is available for booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="p-8 space-y-8">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-600/50 transition-all cursor-pointer group"
                 onDragOver={handleDragOver}
                 onDrop={handleDrop}>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Upload size={32} />
              </div>
              <h4 className="font-bold text-lg">Upload Room Photos</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">Drag and drop high-quality room images here. Minimum 3 photos recommended. Supported formats: JPG, PNG, WebP</p>
              <div className="flex gap-3 mt-6">
                <label className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer">
                  Select Files
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={addImage}
                    className="hidden" 
                  />
                </label>
                <button 
                  onClick={() => addImage()}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Add Sample Image
                </button>
              </div>
            </div>
            
            {formData.images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Uploaded Images ({formData.images.length})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Click the X to remove an image
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="aspect-square relative group">
                      <img 
                        src={image} 
                        alt={`Room ${index + 1}`} 
                        className="w-full h-full object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                        <button 
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform scale-90 group-hover:scale-100 transition-transform"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  {formData.images.length < 8 && (
                    <div 
                      onClick={() => addImage()}
                      className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-600/50 transition-all cursor-pointer group"
                    >
                      <Plus size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs mt-2">Add More</span>
                    </div>
                  )}
                </div>
                {formData.images.length < 3 && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ We recommend at least 3 high-quality photos for better visibility and booking rates.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div className="p-8 space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Select Room Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity.name}
                    onClick={() => toggleAmenity(amenity.name)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                      formData.amenities.includes(amenity.name)
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <amenity.icon size={24} />
                    <span className="text-xs font-medium">{amenity.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.amenities.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Selected Amenities ({formData.amenities.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="p-8 space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-4">Room Review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Room Name</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Type</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.type}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Capacity & Beds</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{(formData.max_capacity || formData.capacity)} guests • {formData.beds}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Size & Bathrooms</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.size} • {formData.baths} bath</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per Night</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${formData.price || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Availability</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.available ? 'Available' : 'Not Available'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Images</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.images.length} images uploaded</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Amenities</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.amenities.length} amenities selected</p>
                  </div>
                </div>
              </div>
              {formData.description && (
                <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Description</span>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">Room Guidelines</h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Room will be visible to travelers immediately after publishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>You can edit room details anytime from the property management page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>High-quality photos significantly increase booking rates</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => step < 4 ? handleNextStep() : handleSubmit()}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {step === 4 ? (roomToEdit ? 'Update Room' : 'Add Room') : 'Continue'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;
