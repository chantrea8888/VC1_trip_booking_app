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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { apiRequest } from '@/services/api';

const AddProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'Boutique Hotel',
    description: '',
    location: '',
    address: '',
    price: '',
    images: [] as File[],
    status: 'active',
    rating: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

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

  React.useEffect(() => {
    const nextPreviews = formData.images.map((file) => URL.createObjectURL(file));
    setImagePreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.images]);

  const addImage = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (!e) {
      fileInputRef.current?.click();
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files.filter((file) => file.type.startsWith('image/'))]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('type', formData.type);
      payload.append('description', formData.description);
      payload.append('location', formData.location);
      payload.append('address', formData.address);
      payload.append('price', String(parseFloat(formData.price)));
      payload.append('rating', formData.rating ? String(parseFloat(formData.rating)) : '0');
      payload.append('status', formData.status);

      if (formData.images.length > 0) {
        payload.append('image', formData.images[0]);
        formData.images.forEach((file) => payload.append('images[]', file));
      }

      const response = await apiRequest('/destinations', {
        method: 'POST',
        body: payload,
      });

      if (response.success) {
        navigate('/destinations');
      } else {
        setSubmitError(response.message || 'Failed to create destination');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Error creating destination. Please check your connection.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const steps = [
    { id: 1, label: 'Basic Info', icon: Info },
    { id: 2, label: 'Media', icon: ImageIcon },
    { id: 3, label: 'Pricing', icon: DollarSign },
    { id: 4, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/destinations')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Add New Property</h3>
          <p className="text-sm text-slate-500 mt-1">List your hotel, villa, or retreat on the Komroung network.</p>
        </div>
      </div>

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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Location Picker</label>
                  <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img alt="Map" className="w-full h-full object-cover opacity-50" src="https://picsum.photos/seed/map/800/600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <MapPin size={32} className="text-blue-600 animate-bounce" />
                        <span className="mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-bold shadow-lg">Pin Location</span>
                      </div>
                    </div>
                  </div>
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

        {step === 2 && (
          <div className="p-8 space-y-8">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-600/50 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Upload size={32} />
              </div>
              <h4 className="font-bold text-lg">Upload Property Photos</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">Drag and drop high-resolution images here. Minimum 5 photos required for verification.</p>
              <div className="flex gap-3 mt-6">
                <label className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer">
                  Select Files
                  <input
                    ref={fileInputRef}
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
                  Add Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((img, index) => (
                <div key={index} className="aspect-square relative group">
                  <img src={img} alt={`Property ${index + 1}`} className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    ×
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Seasonal Pricing</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">High Season (+20%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">Low Season (-15%)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Additional Fees</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-sm">Cleaning Fee</span>
                      <input type="number" placeholder="25" className="w-20 px-2 py-1 bg-white dark:bg-slate-900 rounded text-sm" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-sm">Service Fee</span>
                      <input type="number" placeholder="10" className="w-20 px-2 py-1 bg-white dark:bg-slate-900 rounded text-sm" />
                    </div>
                  </div>
                </div>
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

        {step === 4 && (
          <div className="p-8 space-y-8">
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-800 dark:text-red-200">
                {submitError}
              </div>
            )}
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
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Location</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per Night</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${formData.price || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Rating</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.rating || '0'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Status</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.status === 'draft' ? 'Upcoming' : 'Active'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Images</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formData.images.length} images uploaded</p>
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
              <h4 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">Publishing Guidelines</h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Your property will be created as active and visible to everyone immediately after publishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>You can edit property details anytime from the dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Minimum 5 high-quality photos recommended for better visibility</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button 
            disabled={step === 1 || isLoading}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 transition-all"
          >
            Back
          </button>
          <button 
            disabled={isLoading}
            onClick={() => step < 4 ? handleNextStep() : handleSubmit()}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {isLoading ? 'Publishing...' : (step === 4 ? 'Publish Property' : 'Continue')}
            {!isLoading && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
