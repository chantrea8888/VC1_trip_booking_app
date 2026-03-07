import React from 'react';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  FileText, 
  Camera, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const RegisterVehicle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    plateNumber: '',
    vehicleType: 'SUV (5-7 Seater)',
    makeModel: '',
    fuelType: 'Gasoline',
    price_per_KM: '',
    primaryDriver: ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (!formData.makeModel.trim()) newErrors.makeModel = 'Make & model is required';
    if (!formData.price_per_KM || parseFloat(formData.price_per_KM) <= 0) {
      newErrors.price_per_KM = 'Valid price per KM is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newVehicle = {
      id: Date.now().toString(),
      plateNumber: formData.plateNumber,
      vehicleType: formData.vehicleType,
      makeModel: formData.makeModel,
      fuelType: formData.fuelType,
      price_per_KM: parseFloat(formData.price_per_KM),
      primaryDriver: formData.primaryDriver,
      createdAt: new Date().toISOString()
    };

    const existingVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const updatedVehicles = [...existingVehicles, newVehicle];
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

    navigate('/transport');
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/transport')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Register New Vehicle</h3>
          <p className="text-sm text-slate-500 mt-1">Add a new unit to your transport fleet for tracking and management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <Truck size={20} className="text-blue-600" />
                Vehicle Identification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Plate Number</label>
                  <input
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.plateNumber && 'border border-red-500'
                    )}
                    placeholder="e.g. PP-2A-8842"
                  />
                  {errors.plateNumber && <p className="text-xs text-red-500 mt-1">{errors.plateNumber}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option>SUV (5-7 Seater)</option>
                    <option>Van (12-15 Seater)</option>
                    <option>Bus (25-45 Seater)</option>
                    <option>Luxury Sedan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per KM</label>
                  <input
                    name="price_per_KM"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_KM}
                    onChange={(e) => setFormData({ ...formData, price_per_KM: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.price_per_KM && 'border border-red-500'
                    )}
                    placeholder="e.g. 1.50"
                  />
                  {errors.price_per_KM && <p className="text-xs text-red-500 mt-1">{errors.price_per_KM}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Make & Model</label>
                  <input
                    value={formData.makeModel}
                    onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.makeModel && 'border border-red-500'
                    )}
                    placeholder="e.g. Lexus RX350 (2022)"
                  />
                  {errors.makeModel && <p className="text-xs text-red-500 mt-1">{errors.makeModel}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option>Gasoline</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <User size={20} className="text-blue-600" />
                Driver Assignment
              </h4>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Primary Driver</label>
                <select
                  value={formData.primaryDriver}
                  onChange={(e) => setFormData({ ...formData, primaryDriver: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                >
                  <option>Select a verified driver...</option>
                  <option>Vannak Som</option>
                  <option>Sopheap Kim</option>
                  <option>Rithy Bun</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Only drivers with verified licenses can be assigned.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => navigate('/transport')}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Register Vehicle
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <Camera size={18} className="text-blue-600" />
              Vehicle Photo
            </h4>
            <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
              <Plus size={24} className="text-slate-400 group-hover:text-blue-600 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Photo</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <FileText size={18} className="text-blue-600" />
              Required Documents
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Registration Card', status: 'pending' },
                { label: 'Insurance Policy', status: 'pending' },
                { label: 'Technical Inspection', status: 'pending' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{doc.label}</span>
                  <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Upload</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-2xl border border-blue-600/10 dark:border-blue-600/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-blue-600 shrink-0" size={20} />
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300 leading-relaxed font-medium">
                <strong>Verification:</strong> New vehicles undergo a 24-hour verification process before they can be assigned to live routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVehicle;
