import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, MapPin, Edit, Trash2, X } from 'lucide-react';
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
  created_at?: string;
  updated_at?: string;
}

interface DestinationItem {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  address: string;
  price: number;
  image: string;
  images: string[];
  rating: number;
  totalBookings: number;
  total_bookings: number;
  status: DestinationStatus;
  created_at?: string;
  updated_at?: string;
}

interface DestinationFormData {
  name: string;
  type: string;
  description: string;
  location: string;
  address: string;
  price: string;
  image: string;
  rating: string;
  status: DestinationStatus;
}

interface PropertyCardProps {
  property: DestinationItem;
  onView: (property: DestinationItem) => void;
  onEdit: (property: DestinationItem) => void;
  onDelete: (property: DestinationItem) => void;
  activePromotion: { discount?: string } | null;
}

interface DestinationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  title: string;
  formData: DestinationFormData;
  formErrors: Record<string, string>;
  submitError: string;
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof DestinationFormData, value: string) => void;
}

const DEFAULT_IMAGE = 'https://picsum.photos/seed/destination-default/800/600';

const PROPERTY_TYPES = [
  'Boutique Hotel',
  'Luxury Villa',
  'Eco Lodge',
  'Resort',
  'Villa',
  'Camp',
];

const createEmptyFormData = (): DestinationFormData => ({
  name: '',
  type: 'Boutique Hotel',
  description: '',
  location: '',
  address: '',
  price: '',
  image: '',
  rating: '',
  status: 'active',
});

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.data?.message === 'string' && error.data.message.trim()) return error.data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

const normalizeDestination = (destination: DestinationApiRecord): DestinationItem => {
  const imageList = Array.isArray(destination.images)
    ? destination.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];
  const image =
    (typeof destination.image === 'string' && destination.image.trim()) || imageList[0] || DEFAULT_IMAGE;
  const totalBookings = Math.max(0, toNumber(destination.total_bookings ?? destination.totalBookings, 0));

  return {
    id: String(destination.id),
    name: destination.name?.trim() || 'Untitled destination',
    type: destination.type?.trim() || 'Boutique Hotel',
    description: destination.description?.trim() || '',
    location: destination.location?.trim() || 'Unknown location',
    address: destination.address?.trim() || destination.location?.trim() || '',
    price: toNumber(destination.price, 0),
    image,
    images: imageList.length > 0 ? imageList : [image],
    rating: toNumber(destination.rating, 0),
    totalBookings,
    total_bookings: totalBookings,
    status: destination.status === 'active' ? 'active' : 'draft',
    created_at: destination.created_at,
    updated_at: destination.updated_at,
  };
};

const toFormData = (property: DestinationItem): DestinationFormData => ({
  name: property.name,
  type: property.type,
  description: property.description,
  location: property.location,
  address: property.address,
  price: property.price ? String(property.price) : '',
  image: property.image,
  rating: property.rating ? String(property.rating) : '',
  status: property.status,
});

const PropertyCard = ({ property, onView, onEdit, onDelete, activePromotion }: PropertyCardProps) => {
  const basePrice = typeof property.price === 'number' ? property.price : undefined;
  const discount = typeof activePromotion?.discount === 'string' ? activePromotion.discount : '';

  const computePrice = () => {
    if (typeof basePrice !== 'number') return { finalPrice: undefined, hasDiscount: false };
    if (!discount) return { finalPrice: basePrice, hasDiscount: false };

    const trimmed = discount.trim();

    if (trimmed.endsWith('%')) {
      const pct = parseFloat(trimmed.replace('%', ''));
      if (!Number.isFinite(pct)) return { finalPrice: basePrice, hasDiscount: false };
      return { finalPrice: Math.max(0, basePrice - basePrice * (pct / 100)), hasDiscount: true };
    }

    if (trimmed.startsWith('$')) {
      const amount = parseFloat(trimmed.replace('$', ''));
      if (!Number.isFinite(amount)) return { finalPrice: basePrice, hasDiscount: false };
      return { finalPrice: Math.max(0, basePrice - amount), hasDiscount: true };
    }

    return { finalPrice: basePrice, hasDiscount: false };
  };

  const { finalPrice, hasDiscount } = computePrice();

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
      onClick={() => onView(property)}
    >
      <div className="relative">
        <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${property.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
          {property.status === 'active' ? 'ACTIVE' : 'DRAFT'}
        </div>
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            className="p-2 rounded-full bg-white/85 text-gray-700 hover:bg-white transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(property);
            }}
            title="Edit Property"
          >
            <Edit size={18} />
          </button>
          <button
            className="p-2 rounded-full bg-white/85 text-red-600 hover:bg-white transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(property);
            }}
            title="Delete Property"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">{property.name}</h3>
          <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
            {property.type}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-4">
          <Star className="text-yellow-500 mr-1" size={14} />
          {property.rating > 0 ? property.rating.toFixed(1) : 'N/A'}
          <span className="mx-2">•</span>
          <MapPin size={14} className="mr-1 shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{property.totalBookings}</p>
          </div>

          <div className="text-right">
            {activePromotion && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 mb-1">
                {activePromotion.discount}
              </span>
            )}
            {typeof basePrice === 'number' && (
              <div>
                {hasDiscount && <p className="text-xs text-gray-400 line-through">${basePrice.toFixed(0)}</p>}
                <p className="text-lg font-bold text-gray-900 dark:text-white">${(finalPrice ?? basePrice).toFixed(0)}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">per night</p>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          {activePromotion && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 mb-1">
              {activePromotion.discount}
            </span>
          )}
          {typeof basePrice === 'number' && (
            <div>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">${basePrice.toFixed(0)}</p>
              )}
              <p className="text-lg font-bold text-gray-900 dark:text-white">${(finalPrice ?? basePrice).toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">per night</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DestinationModal = ({
  isOpen,
  isSubmitting,
  title,
  formData,
  formErrors,
  submitError,
  onClose,
  onSubmit,
  onFieldChange,
}: DestinationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">Create or update your destination with backend data.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Name</label>
              <input
                value={formData.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mekong Riverside Villa"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(event) => onFieldChange('type', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Location</label>
              <input
                value={formData.location}
                onChange={(event) => onFieldChange('location', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phnom Penh, Cambodia"
              />
              {formErrors.location && <p className="mt-1 text-xs text-red-500">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Address</label>
              <input
                value={formData.address}
                onChange={(event) => onFieldChange('address', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Price per night (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(event) => onFieldChange('price', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150"
              />
              {formErrors.price && <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(event) => onFieldChange('rating', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4.8"
              />
              {formErrors.rating && <p className="mt-1 text-xs text-red-500">{formErrors.rating}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Image URL</label>
              <input
                value={formData.image}
                onChange={(event) => onFieldChange('image', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) => onFieldChange('description', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe your destination..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(event) => onFieldChange('status', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : title}
          </button>
        </div>
      </div>
    </div>
  );
};

const Destinations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | DestinationStatus>('all');
  const [properties, setProperties] = React.useState<DestinationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<DestinationItem | null>(null);
  const [formData, setFormData] = React.useState<DestinationFormData>(createEmptyFormData());
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [propertyToDelete, setPropertyToDelete] = React.useState<DestinationItem | null>(null);
  const [deleteError, setDeleteError] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadDestinations = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await apiRequest('/destinations');
      const data = Array.isArray(response?.data) ? response.data : [];
      setProperties(data.map((item: DestinationApiRecord) => normalizeDestination(item)));
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Failed to load destinations. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDestinations();
  }, [loadDestinations]);

  React.useEffect(() => {
    if (!feedbackMessage) return undefined;
    const timeoutId = window.setTimeout(() => setFeedbackMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [feedbackMessage]);

  const activeHotelPromotion = React.useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ownerPromotions') || '[]');
      const promotions = Array.isArray(stored) ? stored : [];
      const hotelPromotions = promotions.filter(
        (promotion: any) =>
          promotion?.serviceCategory === 'hotel' && (promotion?.status === 'active' || !promotion?.status),
      );
      return hotelPromotions[0] ?? null;
    } catch {
      return null;
    }
  }, []);

  const filteredProperties = React.useMemo(() => {
    return properties.filter((property) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        search.length === 0 ||
        property.name.toLowerCase().includes(search) ||
        property.location.toLowerCase().includes(search) ||
        property.type.toLowerCase().includes(search);
      const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [filterStatus, properties, searchTerm]);

  const handleView = (property: DestinationItem) => {
    navigate(`/destinations/${property.id}`, { state: { property } });
  };

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setFormData(createEmptyFormData());
    setFormErrors({});
    setSubmitError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (property: DestinationItem) => {
    setEditingProperty(property);
    setFormData(toFormData(property));
    setFormErrors({});
    setSubmitError('');
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;
    setShowFormModal(false);
    setEditingProperty(null);
    setFormData(createEmptyFormData());
    setFormErrors({});
    setSubmitError('');
  };

  const handleFormFieldChange = (field: keyof DestinationFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: field === 'status' && value === 'active' ? 'active' : field === 'status' ? 'draft' : value,
    }));

    setFormErrors((previous) => {
      if (!previous[field]) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Destination name is required.';
    if (!formData.location.trim()) nextErrors.location = 'Location is required.';

    const price = parseFloat(formData.price);
    if (!formData.price.trim() || !Number.isFinite(price) || price < 0) {
      nextErrors.price = 'Enter a valid non-negative price.';
    }

    if (formData.rating.trim()) {
      const rating = parseFloat(formData.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        nextErrors.rating = 'Rating must be between 0 and 5.';
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      name: formData.name.trim(),
      type: formData.type.trim() || 'Boutique Hotel',
      description: formData.description.trim(),
      location: formData.location.trim(),
      address: formData.address.trim(),
      price: parseFloat(formData.price),
      image: formData.image.trim() || DEFAULT_IMAGE,
      images: formData.image.trim() ? [formData.image.trim()] : [],
      rating: formData.rating.trim() ? parseFloat(formData.rating) : 0,
      status: formData.status,
    };

    try {
      const response = await apiRequest(editingProperty ? `/destinations/${editingProperty.id}` : '/destinations', {
        method: editingProperty ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      const savedProperty = normalizeDestination(response?.data ?? { ...payload, id: editingProperty?.id ?? Date.now() });

      setProperties((previous) => {
        if (editingProperty) {
          return previous.map((item) => (item.id === editingProperty.id ? savedProperty : item));
        }

        return [savedProperty, ...previous];
      });

      setFeedbackMessage(editingProperty ? 'Destination updated successfully.' : 'Destination created successfully.');
      handleCloseForm();
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          editingProperty ? 'Failed to update destination. Please try again.' : 'Failed to create destination. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (property: DestinationItem) => {
    setPropertyToDelete(property);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setPropertyToDelete(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await apiRequest(`/destinations/${propertyToDelete.id}`, { method: 'DELETE' });
      setProperties((previous) => previous.filter((item) => item.id !== propertyToDelete.id));
      setFeedbackMessage('Destination deleted successfully.');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error, 'Failed to delete destination. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Destinations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your property listings with live backend data.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => void loadDestinations()}
              className="px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add New Destination
            </button>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-300">
            {feedbackMessage}
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>{loadError}</span>
            <button
              onClick={() => void loadDestinations()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors self-start md:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations by name, type, or location..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                All ({properties.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Active ({properties.filter((property) => property.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Draft ({properties.filter((property) => property.status === 'draft').length})
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Loading destinations...</div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={handleView}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                activePromotion={activeHotelPromotion}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No destinations found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or filters, or add a new destination.</p>
          </div>
        )}

        <DestinationModal
          isOpen={showFormModal}
          isSubmitting={isSubmitting}
          title={editingProperty ? 'Update Destination' : 'Create Destination'}
          formData={formData}
          formErrors={formErrors}
          submitError={submitError}
          onClose={handleCloseForm}
          onSubmit={() => void handleSubmitForm()}
          onFieldChange={handleFormFieldChange}
        />

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
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

              {deleteError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void confirmDelete()}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Property'}
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
