import { apiRequest } from './api';

const DEFAULT_IMAGE = 'https://picsum.photos/seed/public-destination/800/600';

const toNumber = (value, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getBackendOrigin = () =>
  import.meta.env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000';

const resolveImage = (raw) => {
  const rawImage = typeof raw === 'string' ? raw.trim() : '';
  if (!rawImage) return DEFAULT_IMAGE;
  if (rawImage.startsWith('http')) return rawImage;
  return `${getBackendOrigin()}/${rawImage.replace(/^\/+/, '')}`;
};

export const normalizeDestination = (destination) => {
  const imageList = Array.isArray(destination?.images)
    ? destination.images.filter((image) => typeof image === 'string' && image.trim().length > 0)
    : [];

  return {
    id: Number.isFinite(Number(destination?.id)) ? Number(destination.id) : Math.random(),
    name: String(destination?.name ?? '').trim() || 'Untitled destination',
    type: String(destination?.type ?? '').trim() || 'Hotel',
    description: String(destination?.description ?? '').trim() || 'Discover this destination and plan your stay.',
    location: String(destination?.location ?? '').trim() || 'Unknown location',
    price: toNumber(destination?.price, 0),
    image: resolveImage(destination?.image || imageList[0]),
    rating: toNumber(destination?.rating, 0),
    amenities: Array.isArray(destination?.amenities) ? destination.amenities : [],
    status: destination?.status === 'active' ? 'active' : 'draft',
  };
};

export const getPublicDestinations = async () => {
  const response = await apiRequest('/destinations/public/all');
  const data = Array.isArray(response?.data) ? response.data : [];
  return data.map((item) => normalizeDestination(item));
};
