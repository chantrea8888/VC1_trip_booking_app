import React from 'react';
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Image as ImageIcon,
  DollarSign,
  Save,
  Trash2,
  X,
  Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const EditProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    id: '',
    name: '',
    type: 'Boutique Hotel',
    description: '',
    location: '',
    address: '',
    price: '',
    images: [] as string[],
    status: 'draft',
    totalBookings: 0,
    rating: ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  React.useEffect(() => {
    // Get property data from location state or localStorage
    const propertyData = location.state?.property;
    if (propertyData) {
      setFormData({
        id: propertyData.id,
        name: propertyData.name || '',
        type: propertyData.type || 'Boutique Hotel',
        description: propertyData.description || '',
        location: propertyData.location || '',
        address: propertyData.address || propertyData.location || '',
        price: propertyData.price?.toString() || '',
        images: propertyData.images || [propertyData.image] || [],
        status: propertyData.status || 'draft',
        totalBookings: propertyData.totalBookings || 0,
        rating: propertyData.rating?.toString?.() || ''
      });
    } else {
      // Fallback to localStorage if no state passed
      const properties = JSON.parse(localStorage.getItem('properties') || '[]');
      const defaultProperties = [
        { id: '1', name: 'Mekong Riverside Villa', location: 'Phnom Penh, Cambodia', price: 185, rating: 4.9, status: 'active', image: 'https://picsum.photos/seed/villa1/800/600', totalBookings: 24 },
        { id: '2', name: 'Koh Rong Luxury Retreat', location: 'Koh Rong, Sihanoukville', price: 340, rating: 4.8, status: 'active', image: 'https://picsum.photos/seed/villa2/800/600', totalBookings: 18 },
      ];
      const allProperties = [...defaultProperties, ...properties];
      const propertyId = location.pathname.split('/').pop();
      const property = allProperties.find(p => p.id === propertyId);
      
      if (property) {
        setFormData({
          id: property.id,
          name: property.name,
          type: property.type || 'Boutique Hotel',
          description: property.description || '',
          location: property.location,
          address: property.address || property.location,
          price: property.price?.toString() || '',
          images: property.images || [property.image] || [],
          status: property.status,
          totalBookings: property.totalBookings || 0,
          rating: property.rating?.toString?.() || ''
        });
      }
    }
  }, [location]);

  const steps = [
    { id: 1, label: 'Basic Info', icon: Info },
    { id: 2, label: 'Media', icon: ImageIcon },
    { id: 3, label: 'Pricing', icon: DollarSign },
    { id: 4, label: 'Review', icon: CheckCircle2 },
  ];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Property name is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    if (currentStep === 3) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Valid price is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addImage = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      files.forEach((file: File) => {
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
      const newImage = `https://picsum.photos/seed/property${Date.now()}/800/600`;
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

  const handleUpdate = () => {
    if (!validateStep(4)) return;

    const updatedProperty = {
      id: formData.id,
      name: formData.name,
      location: formData.location,
      price: parseFloat(formData.price),
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      status: formData.status,
      image: formData.images[0] || 'https://picsum.photos/seed/updatedproperty/800/600',
      images: formData.images,
      type: formData.type,
      description: formData.description,
      address: formData.address,
      totalBookings: formData.totalBookings
    };

    // Update in localStorage
    const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedProperties = existingProperties.map(p => 
      p.id === formData.id ? updatedProperty : p
    );
    localStorage.setItem('properties', JSON.stringify(updatedProperties));

    navigate('/destinations');
  };

  const handleDelete = () => {
    // Remove from localStorage
    const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedProperties = existingProperties.filter(p => p.id !== formData.id);
    localStorage.setItem('properties', JSON.stringify(updatedProperties));

    navigate('/destinations');
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/destinations')}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Edit Property</h3>
            <p className="text-sm text-slate-500 mt-1">Update property details and settings.</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={18} className="mr-2" />
          Delete Property
        </button>
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Property Name</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.name && "border-red-500"
                    )} 
                    placeholder="e.g. Mekong Riverside Villa" 
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Property Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option>Boutique Hotel</option>
                    <option>Luxury Villa</option>
                    <option>Eco Lodge</option>
                    <option>Resort</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium resize-none" 
                    placeholder="Describe the unique features of your property..."
                  ></textarea>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'draft'})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Full Address</label>
                  <input 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.address && "border-red-500"
                    )} 
                    placeholder="Street 123, Sangkat Chakto Mukh..." 
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Location (City, Country)</label>
                  <input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.location && "border-red-500"
                    )}
                    placeholder="e.g. Phnom Penh, Cambodia"
                  />
                  {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Rating (optional)</label>
                  <input 
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                    placeholder="e.g. 4.9"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="p-8 space-y-8">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-600/50 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Upload size={32} />
              </div>
              <h4 className="font-bold text-lg">Update Property Photos</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">Drag and drop new images or click to select files.</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="aspect-square relative group">
                  <img src={image} alt={`Property ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div
                onClick={() => addImage()}
                className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Plus size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Base Price (USD/night)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.price && "border-red-500"
                    )} 
                    placeholder="150.00" 
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Bookings</label>
                  <input 
                    type="number"
                    value={formData.totalBookings}
                    onChange={(e) => setFormData({...formData, totalBookings: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" 
                    placeholder="0" 
                    readOnly
                  />
                  <p className="text-xs text-slate-500">This value is automatically updated based on bookings</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Cancellation Policy</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none">
                    <option>Flexible (24h)</option>
                    <option>Moderate (48h)</option>
                    <option>Strict (7 days)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="p-8 space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-4">Property Review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Property Name</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Type</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.type}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Address</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.address || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per Night</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${formData.price || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Status</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.status === 'draft' ? 'Draft Mode' : 'Active'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Bookings</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.totalBookings}</p>
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
            onClick={() => step < 4 ? handleNextStep() : handleUpdate()}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {step === 4 ? (
              <>
                <Save size={18} />
                Update Property
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

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
              Are you sure you want to delete "{formData.name}"? This will permanently remove the property and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProperty;
