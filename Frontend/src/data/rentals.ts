export interface RentalVehicle {
  id: number;
  name: string;
  type: 'Economy' | 'SUV' | 'Luxury' | 'Electric' | 'Sport';
  pricePerDay: number;
  seats: number;
  transmission: 'Manual' | 'Automatic';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  features: string;
  image: string;
  available: boolean;
  rating: number;
  reviews: number;
}

export const RENTAL_VEHICLES: RentalVehicle[] = [
  {
    id: 1,
    name: 'Toyota Camry',
    type: 'Economy',
    pricePerDay: 45,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    features: 'GPS, Bluetooth, Backup Camera',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a9208b?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 2,
    name: 'Honda CR-V',
    type: 'SUV',
    pricePerDay: 65,
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Petrol',
    features: 'All-Wheel Drive, Lane Assist, Apple CarPlay',
    image: 'https://images.unsplash.com/photo-1549398349-1e56be84a820?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: 3,
    name: 'Tesla Model 3',
    type: 'Electric',
    pricePerDay: 85,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric',
    features: 'Autopilot, Premium Audio, Full Self-Driving',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.8,
    reviews: 203,
  },
  {
    id: 4,
    name: 'BMW 5 Series',
    type: 'Luxury',
    pricePerDay: 120,
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    features: 'Leather Seats, Sunroof, Premium Sound',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 5,
    name: 'Ford Mustang',
    type: 'Sport',
    pricePerDay: 95,
    seats: 4,
    transmission: 'Manual',
    fuel: 'Petrol',
    features: 'Sport Mode, Premium Audio, Rear Spoiler',
    image: 'https://images.unsplash.com/photo-1583121274668-f7635e1f4a3b?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.4,
    reviews: 92,
  },
  {
    id: 6,
    name: 'Mitsubishi Outlander',
    type: 'SUV',
    pricePerDay: 70,
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    features: '7 Seats, AWD, Android Auto',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800',
    available: true,
    rating: 4.3,
    reviews: 67,
  },
];
