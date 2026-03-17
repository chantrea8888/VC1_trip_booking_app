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
import { cn } from '@/src/utils/utils';
import { apiRequest } from '@/src/services/api';

type DestinationStatus = 'active' | 'draft';

interface DestinationApiRecord {
  id: string | number;
  name?: string;
  type?: string;
  description?: string | null;
  location?: string;
  address?: string | null;
  price?: number | string | null;
  image?: string | null;
  images?: string[] | null;
  rating?: number | string | null;
  total_bookings?: number | null;
  totalBookings?: number | null;
  status?: DestinationStatus;
}

const DEFAULT_IMAGE = 'https://picsum.photos/seed/updatedproperty/800/600';

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.data?.message === 'string' && error.data.message.trim()) return error.data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

const normalizePropertyData = (propertyData?: DestinationApiRecord | null) => {
  const imageList = Array.isArray(propertyData?.images)
    ? propertyData.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];
  const image = (typeof propertyData?.image === 'string' && propertyData.image.trim()) || imageList[0] || DEFAULT_IMAGE;
  const totalBookings = Math.max(0, toNumber(propertyData?.total_bookings ?? propertyData?.totalBookings, 0));

  return {
    id: propertyData?.id ? String(propertyData.id) : '',
    name: propertyData?.name?.trim() || '',
    type: propertyData?.type?.trim() || 'Boutique Hotel',
    description: propertyData?.description?.trim() || '',
    location: propertyData?.location?.trim() || '',
    address: propertyData?.address?.trim() || propertyData?.location?.trim() || '',
    price: propertyData?.price !== null && propertyData?.price !== undefined ? String(propertyData.price) : '',
    images: imageList.length > 0 ? imageList : [image],
    status: propertyData?.status === 'active' ? 'active' as const : 'draft' as const,
    totalBookings,
    rating: propertyData?.rating !== null && propertyData?.rating !== undefined ? String(propertyData.rating) : '',
  };
};

const EditProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyId = React.useMemo(() => location.pathname.split('/').pop() ?? '', [location.pathname]);
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');
  const [deleteError, setDeleteError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    const propertyFromState = location.state?.property as DestinationApiRecord | undefined;

    if (propertyFromState?.id) {
      if (isMounted) {
        setFormData(normalizePropertyData(propertyFromState));
        setLoadError('');
        setIsLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }

    if (!propertyId) {
      setLoadError('Property not found.');
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadProperty = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await apiRequest(`/destinations/${propertyId}`);
        if (!response?.data) {
          throw new Error('Property not found.');
        }

        if (isMounted) {
          setFormData(normalizePropertyData(response.data));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(getErrorMessage(error, 'Failed to load property details. Please try again.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProperty();

    return () => {
      isMounted = false;
    };
  }, [location.state, propertyId]);

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

  const handleUpdate = async () => {
    if (!validateStep(4)) return;

    if (!formData.id) {
      setSubmitError('Property not found.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await apiRequest(`/destinations/${formData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          location: formData.location,
          address: formData.address,
          price: parseFloat(formData.price),
          image: formData.images[0] || DEFAULT_IMAGE,
          images: formData.images,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          status: formData.status,
        }),
      });

      navigate('/destinations');
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to update property. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) {
      setDeleteError('Property not found.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await apiRequest(`/destinations/${formData.id}`, {
        method: 'DELETE',
      });

      setShowDeleteModal(false);
      navigate('/destinations');
    } catch (error) {
      setDeleteError(getErrorMessage(error, 'Failed to delete property. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading property details...
        </div>
      </div>
    );
  }

  if (loadError || !formData.id) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm dark:border-red-900/30 dark:bg-red-900/20">
          <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">Unable to load property</h3>
          <p className="mt-3 text-sm text-red-600 dark:text-red-200">
            {loadError || 'Property not found.'}
          </p>
          <button
            onClick={() => navigate('/destinations')}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
          disabled={isSubmitting || isDeleting}
          className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={18} className="mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Property'}
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
        {submitError && (
          <div className="mx-8 mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {submitError}
          </div>
        )}

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
            disabled={step === 1 || isSubmitting || isDeleting}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 transition-all"
          >
            Back
          </button>
          <button 
            disabled={isSubmitting || isDeleting}
            onClick={() => step < 4 ? handleNextStep() : handleUpdate()}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : step === 4 ? (
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              {deleteError && (
                <div className="mb-0 hidden" />
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Property'}
              </button>
            </div>
            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
                {deleteError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProperty;
