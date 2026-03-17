export interface Destination {
  id: number;
  name: string;
  country: string;
  region: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  priceFrom: number;
  duration: string;
  highlights: string[];
  available: boolean;
}

export const ALL_DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: 'Siem Reap & Angkor Wat',
    country: 'Cambodia',
    region: 'North',
    description: 'Home to the magnificent Angkor Wat temple complex and ancient Khmer architecture.',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69c5?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 2847,
    priceFrom: 350,
    duration: '3-5 days',
    highlights: ['Angkor Wat Sunrise', 'Bayon Temple', 'Ta Prohm', 'Floating Villages'],
    available: true,
  },
  {
    id: 2,
    name: 'Phnom Penh Capital',
    country: 'Cambodia',
    region: 'South',
    description: 'Vibrant capital city with royal palace, museums, and bustling markets.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviews: 1523,
    priceFrom: 280,
    duration: '2-3 days',
    highlights: ['Royal Palace', 'National Museum', 'Killing Fields', 'Riverside Promenade'],
    available: true,
  },
  {
    id: 3,
    name: 'Sihanoukville Beaches',
    country: 'Cambodia',
    region: 'Coast',
    description: 'Tropical paradise with pristine beaches, islands, and vibrant nightlife.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviews: 987,
    priceFrom: 420,
    duration: '3-4 days',
    highlights: ['Sokha Beach', 'Serendipity Beach', 'Koh Rong Island', 'Sunset Cruises'],
    available: true,
  },
  {
    id: 4,
    name: 'Battambang Countryside',
    country: 'Cambodia',
    region: 'Northwest',
    description: 'Charming colonial town with bamboo train, ancient temples, and rural life.',
    image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviews: 642,
    priceFrom: 220,
    duration: '2-3 days',
    highlights: ['Bamboo Train', 'Phnom Sampeau', 'Colonial Architecture', 'Countryside Tours'],
    available: true,
  },
  {
    id: 5,
    name: 'Kampot & Kep',
    country: 'Cambodia',
    region: 'Southwest',
    description: 'Sleepy riverside towns known for pepper plantations, crab market, and French colonial charm.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800',
    rating: 4.3,
    reviews: 523,
    priceFrom: 260,
    duration: '2-3 days',
    highlights: ['Kampot Pepper Farms', 'Kep Crab Market', 'Bokor Mountain', 'Riverside Dining'],
    available: true,
  },
  {
    id: 6,
    name: 'Mondulkiri Wildlife',
    country: 'Cambodia',
    region: 'East',
    description: 'Remote highland province with lush forests, waterfalls, and elephant sanctuaries.',
    image: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews: 318,
    priceFrom: 380,
    duration: '3-4 days',
    highlights: ['Elephant Valley Project', 'Bou Sra Waterfall', 'Indigenous Villages', 'Jungle Trekking'],
    available: true,
  },
];
