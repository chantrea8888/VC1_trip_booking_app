export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  amenities?: string[];
  rooms?: number;
  available?: boolean;
  hotel_name?: string;
  city?: string;
  country?: string;
  address?: string;
  stars_rating?: number;
  is_active?: boolean;
  owner?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  created_at?: string;
}

<<<<<<< HEAD
export const ALL_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Sokha Beach Resort',
    location: 'Sihanoukville',
    price: 18,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    description: 'Luxury beachfront resort with private beach access.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    rooms: 150,
    available: true,
  },
  {
    id: 2,
    name: 'Raffles Hotel Le Royal',
    location: 'Phnom Penh',
    price: 20,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    description: 'Historic colonial-era luxury hotel in the heart of the city.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Bar', 'Business Center'],
    rooms: 200,
    available: true,
  },
  {
    id: 3,
    name: 'Templation Hotel',
    location: 'Siem Reap',
    price: 15,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69c5?auto=format&fit=crop&q=80&w=800',
    description: 'Boutique hotel near Angkor Wat with tropical gardens.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    rooms: 80,
    available: true,
  },
  {
    id: 4,
    name: 'Koh Rong Sandy Beach Resort',
    location: 'Koh Rong',
    price: 12,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800',
    description: 'Eco-friendly beach bungalows on a pristine island.',
    amenities: ['WiFi', 'Restaurant', 'Diving Center'],
    rooms: 45,
    available: true,
  },
  {
    id: 5,
    name: 'Amanjaya Pancam Suites Hotel',
    location: 'Kampot',
    price: 10,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800',
    description: 'Riverside boutique hotel with mountain views.',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Tour Desk'],
    rooms: 60,
    available: true,
  },
];
=======
import { hotelService } from '../services/hotelService.js';

export const getHotels = async (): Promise<Hotel[]> => {
  try {
    console.log('🏨 Loading hotels from database...');
    const response = await hotelService.getAllHotels();
    
    if (!response.data || response.data.length === 0) {
      console.warn('⚠️  No hotels found in database! Make sure destinations exist with status=active');
      return [];
    }

    const hotels = response.data.map((destination: Hotel) => ({
      ...destination,
      id: destination.id,
      name: destination.name || destination.hotel_name || 'Untitled Destination',
      location: destination.location || `${destination.city || ''}${destination.country ? ', ' + destination.country : ''}`.trim(),
      rating: parseFloat(String(destination.stars_rating || destination.rating || 0)),
      available: destination.is_active ?? destination.available ?? true,
      price: parseFloat(String(destination.price || 100)),
      image: destination.image || 'https://images.unsplash.com/photo-1569660072562-47a003360691?auto=format&fit=crop&q=80&w=800',
      amenities: Array.isArray(destination.amenities) ? destination.amenities : ['WiFi', 'Pool', 'Restaurant'],
      rooms: destination.rooms || 50,
      description: destination.description || 'Discover your perfect stay',
    }));

    console.log('✅ Successfully loaded', hotels.length, 'hotels from database');
    return hotels;
  } catch (error) {
    console.error('❌ Error fetching hotels from database:', error);
    return [];
  }
};

export const ALL_HOTELS: Hotel[] = [];

>>>>>>> social-account
