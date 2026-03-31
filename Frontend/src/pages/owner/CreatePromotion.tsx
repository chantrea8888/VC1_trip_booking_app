import React from 'react';
import { 
  ArrowLeft, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Target,
  Zap,
  Layout,
  MapPin,
  Car,
  Search,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { apiRequest } from '@/services/api';
import { createPromotion } from '@/services/promotionService';

type PromotionServiceCategory = 'hotel' | 'transport' | 'all';

type PromotionType = 'Percentage Discount' | 'Fixed Amount Off' | 'Bundle Offer' | 'Early Bird Special';

interface Destination {
  id: string;
  name: string;
  location: string;
  type: string;
}

interface Transport {
  id: string;
  name: string;
  route: string;
  type: string;
}

const dedupeById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const CreatePromotion = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);

  const [promotionType, setPromotionType] = React.useState<PromotionType | null>(null);
  const [serviceCategory, setServiceCategory] = React.useState<PromotionServiceCategory>('hotel');
  const [campaignName, setCampaignName] = React.useState('');
  const [discountValue, setDiscountValue] = React.useState('');
  const [promoCode, setPromoCode] = React.useState('');
  const [promoColor, setPromoColor] = React.useState('#3B82F6'); // Default blue
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  
  // Linked items state
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [transports, setTransports] = React.useState<Transport[]>([]);
  const [linkedDestinations, setLinkedDestinations] = React.useState<string[]>([]);
  const [linkedTransports, setLinkedTransports] = React.useState<string[]>([]);
  const [searchDestination, setSearchDestination] = React.useState('');
  const [searchTransport, setSearchTransport] = React.useState('');
  const [isLoadingDestinations, setIsLoadingDestinations] = React.useState(false);
  const [isLoadingTransports, setIsLoadingTransports] = React.useState(false);
  const [showAdditionalLinkedItems, setShowAdditionalLinkedItems] = React.useState(false);

  const steps = [
    { id: 1, label: 'Promotion Type', icon: Target },
    { id: 2, label: 'Campaign Details', icon: Info },
    { id: 3, label: 'Linked Items', icon: Layout },
    { id: 4, label: 'Rules & Limits', icon: Zap },
    { id: 5, label: 'Preview', icon: CheckCircle2 },
  ];

  const showDestinationsSection = serviceCategory === 'hotel' || showAdditionalLinkedItems;
  const showTransportsSection = serviceCategory === 'transport' || showAdditionalLinkedItems;
  const effectiveServiceCategory: PromotionServiceCategory =
    linkedDestinations.length > 0 && linkedTransports.length > 0 ? 'all' : serviceCategory;

  // Load destinations and transports when entering step 3
  React.useEffect(() => {
    if (step === 3) {
      loadDestinations();
      loadTransports();
    }
  }, [step]);

  React.useEffect(() => {
    setShowAdditionalLinkedItems(false);
  }, [serviceCategory]);

  const loadDestinations = async () => {
    setIsLoadingDestinations(true);
    try {
      const response = await apiRequest('/destinations');
      const data = Array.isArray(response?.data) ? response.data : [];
      const mapped = data.map((d: any, index: number) => ({
        id: String(d.id ?? d.destination_id ?? d._id ?? `${d.name || 'destination'}-${d.location || 'location'}-${index}`),
        name: d.name || 'Untitled',
        location: d.location || '',
        type: d.type || 'Hotel'
      }));
      setDestinations(dedupeById(mapped));
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  const loadTransports = async () => {
    setIsLoadingTransports(true);
    try {
      const response = await apiRequest('/owner/transports');
      const data = Array.isArray(response?.data) ? response.data : [];
      const mapped = data.map((t: any, index: number) => ({
        id: String(t.transport_id ?? t.id ?? t.transportId ?? `${t.service_name || 'transport'}-${t.route_description || 'route'}-${index}`),
        name: t.service_name || 'Untitled',
        route: t.route_description || '',
        type: t.transport_type || 'Car Rental'
      }));
      setTransports(dedupeById(mapped));
    } catch (error) {
      console.error('Failed to load transports:', error);
    } finally {
      setIsLoadingTransports(false);
    }
  };

  const toggleDestination = (id: string) => {
    setLinkedDestinations((prev) => (prev[0] === id ? [] : [id]));
  };

  const toggleTransport = (id: string) => {
    setLinkedTransports((prev) => (prev[0] === id ? [] : [id]));
  };

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchDestination.toLowerCase()) ||
    d.location.toLowerCase().includes(searchDestination.toLowerCase())
  );

  const filteredTransports = transports.filter(t => 
    t.name.toLowerCase().includes(searchTransport.toLowerCase()) ||
    t.route.toLowerCase().includes(searchTransport.toLowerCase())
  );

  const getDiscountSuffix = () => {
    if (promotionType === 'Percentage Discount') return '%';
    if (promotionType === 'Fixed Amount Off') return '$';
    return '';
  };

  const formatDiscount = () => {
    if (!promotionType) return '-';
    const v = discountValue.trim();
    if (!v) return '-';
    if (promotionType === 'Percentage Discount') return `${v}%`;
    if (promotionType === 'Fixed Amount Off') return `$${v}`;
    return v;
  };

  const launchCampaign = async () => {
    if (!promotionType) {
      setStep(1);
      return;
    }
    if (!campaignName.trim()) {
      setStep(2);
      return;
    }

    const payload = {
      title: campaignName.trim(),
      description: '',
      discount: formatDiscount(),
      type: promotionType,
      start_date: startDate || null,
      end_date: endDate || null,
      expiry: endDate || null,
      is_active: true,
      service_category: effectiveServiceCategory,
      linked_destinations: linkedDestinations.map((id) => Number(id)).filter(Number.isFinite),
      linked_transports: linkedTransports.map((id) => Number(id)).filter(Number.isFinite),
    };

    try {
      await createPromotion(payload);
      navigate('/promotions');
    } catch (error: any) {
      console.error('Failed to create promotion:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create promotion. Please try again.';
      if (error?.errors) {
        const errorFields = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages[0] : messages;
            return `${field}: ${msgs}`;
          })
          .join('\n');
        errorMessage = `Validation error:\n${errorFields}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/promotions')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Create New Promotion</h3>
          <p className="text-sm text-slate-500 mt-1">Design a marketing campaign to drive more traffic to your services.</p>
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
            <h4 className="font-bold text-lg">Select Promotion Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Percentage Discount', desc: 'Offer a percentage off the total booking price.', icon: Tag, color: 'blue' },
                { title: 'Fixed Amount Off', desc: 'Deduct a specific dollar amount from the price.', icon: Zap, color: 'amber' },
                { title: 'Bundle Offer', desc: 'Buy one service, get another at a discount.', icon: Layout, color: 'emerald' },
                { title: 'Early Bird Special', desc: 'Reward guests who book well in advance.', icon: Calendar, color: 'purple' },
              ].map((type, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setPromotionType(type.title as PromotionType);
                    setStep(2);
                  }}
                  className={cn(
                    "p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 hover:border-blue-600/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer group",
                    promotionType === (type.title as PromotionType)
                      ? "border-blue-600/40"
                      : "border-slate-100 dark:border-slate-800",
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
                    type.color === 'blue' ? "bg-blue-600 text-white" :
                    type.color === 'amber' ? "bg-amber-500 text-white" :
                    type.color === 'emerald' ? "bg-emerald-500 text-white" :
                    "bg-purple-500 text-white"
                  )}>
                    <type.icon size={24} />
                  </div>
                  <h5 className="font-bold text-sm mb-1">{type.title}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Service Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as PromotionServiceCategory)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Campaign Name</label>
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                    placeholder="e.g. Water Festival Special"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Discount Value</label>
                  <div className="relative">
                    <input
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                      placeholder="20"
                    />
                    {getDiscountSuffix() && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{getDiscountSuffix()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Start Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">End Date</label>
                  <input
                    type="date"
                    min={startDate || new Date().toISOString().split('T')[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Promo Code (Optional)</label>
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                    placeholder="e.g. SUMMER2024"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Badge Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={promoColor}
                      onChange={(e) => setPromoColor(e.target.value)}
                      className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                    />
                    <input
                      value={promoColor}
                      onChange={(e) => setPromoColor(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="text-blue-600" size={24} />
              <h4 className="font-bold text-lg">Select Linked Items</h4>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Choose which destinations and transports this promotion applies to. Only selected items will receive the discount.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">
                {serviceCategory === 'hotel'
                  ? 'Focusing on hotel destinations for this campaign.'
                  : 'Focusing on transport services for this campaign.'}
              </span>
              <button
                type="button"
                onClick={() => setShowAdditionalLinkedItems((prev) => !prev)}
                className="text-xs font-bold text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition"
              >
                {showAdditionalLinkedItems
                  ? 'Hide the other category'
                  : `Link ${serviceCategory === 'hotel' ? 'transports' : 'destinations'} too`}
              </button>
            </div>
            
            {/* Linked Destinations */}
            {showDestinationsSection && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="text-emerald-500" size={18} />
                  <h5 className="font-semibold text-sm">Linked Destinations</h5>
                  <span className="ml-auto text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {linkedDestinations.length} selected
                  </span>
                </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                {isLoadingDestinations ? (
                  <p className="text-sm text-slate-500 text-center py-4">Loading destinations...</p>
                ) : filteredDestinations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No destinations found</p>
                ) : (
                  filteredDestinations.map((destination) => (
                    <div
                      key={destination.id}
                      onClick={() => toggleDestination(destination.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        linkedDestinations.includes(destination.id)
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border",
                        linkedDestinations.includes(destination.id)
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}>
                        {linkedDestinations.includes(destination.id) && <CheckCircle2 size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{destination.name}</p>
                        <p className="text-xs text-slate-500 truncate">{destination.location}</p>
                      </div>
                      <span className="text-xs text-slate-400">{destination.type}</span>
                    </div>
                  ))
                )}
              </div>
              </div>
            )}

            {/* Linked Transports */}
            {showTransportsSection && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="text-blue-500" size={18} />
                  <h5 className="font-semibold text-sm">Linked Transports</h5>
                  <span className="ml-auto text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {linkedTransports.length} selected
                  </span>
                </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search transports..."
                  value={searchTransport}
                  onChange={(e) => setSearchTransport(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                {isLoadingTransports ? (
                  <p className="text-sm text-slate-500 text-center py-4">Loading transports...</p>
                ) : filteredTransports.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No transports found</p>
                ) : (
                  filteredTransports.map((transport) => (
                    <div
                      key={transport.id}
                      onClick={() => toggleTransport(transport.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        linkedTransports.includes(transport.id)
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border",
                        linkedTransports.includes(transport.id)
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}>
                        {linkedTransports.includes(transport.id) && <CheckCircle2 size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{transport.name}</p>
                        <p className="text-xs text-slate-500 truncate">{transport.route}</p>
                      </div>
                      <span className="text-xs text-slate-400">{transport.type}</span>
                    </div>
                  ))
                )}
              </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-6">
            <h4 className="font-bold text-lg">Rules & Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Usage Limit</label>
                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. 500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Minimum Booking Amount</label>
                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium" placeholder="e.g. 100" />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-8 space-y-6">
            <h4 className="font-bold text-lg">Preview</h4>
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Campaign</p>
                  <p className="text-lg font-bold">{campaignName || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</p>
                  <p className="text-sm font-bold capitalize">{effectiveServiceCategory}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Type</p>
                  <p className="text-sm font-semibold">{promotionType || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Discount</p>
                  <p className="text-sm font-semibold text-blue-600">{formatDiscount()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Dates</p>
                  <p className="text-sm font-semibold">{startDate || '-'} → {endDate || '-'}</p>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Linked Items</p>
                <div className="flex flex-wrap gap-2">
                  {linkedDestinations.length === 0 && linkedTransports.length === 0 ? (
                    <span className="text-sm text-slate-500">No items selected (promotion will not apply to any items)</span>
                  ) : (
                    <>
                      {linkedDestinations.map(id => {
                        const dest = destinations.find(d => d.id === id);
                        return dest ? (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                            <MapPin size={12} />
                            {dest.name}
                          </span>
                        ) : null;
                      })}
                      {linkedTransports.map(id => {
                        const trans = transports.find(t => t.id === id);
                        return trans ? (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                            <Car size={12} />
                            {trans.name}
                          </span>
                        ) : null;
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 transition-all"
          >
            Back
          </button>
          <button 
            onClick={() => {
              if (step < 5) {
                if (step === 1 && !promotionType) return;
                setStep((s) => s + 1);
                return;
              }
              launchCampaign();
            }}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
          >
            {step === 5 ? 'Launch Campaign' : 'Continue'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePromotion;
