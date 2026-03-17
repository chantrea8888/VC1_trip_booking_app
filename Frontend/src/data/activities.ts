export type AvailableActivity = {
  id: number;
  name: string;
  price: number;
  guests: number;
  image: string;
  date: string;
};

export const AVAILABLE_ACTIVITIES: AvailableActivity[] = [
  {
    id: 1,
    name: 'Angkor Wat Sunrise Tour',
    price: 35,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=800',
    date: 'Day 1',
  },
  {
    id: 2,
    name: 'Floating Village Experience',
    price: 28,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1524492449094-dc2f73c30b6a?auto=format&fit=crop&q=80&w=800',
    date: 'Day 2',
  },
  {
    id: 3,
    name: 'Khmer Cooking Class',
    price: 22,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800',
    date: 'Day 3',
  },
  {
    id: 4,
    name: 'Phnom Penh City Highlights',
    price: 30,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1585653621032-0b2b0c1c2b8a?auto=format&fit=crop&q=80&w=800',
    date: 'Day 4',
  },
  {
    id: 5,
    name: 'Kampot Pepper Farm Visit',
    price: 18,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800',
    date: 'Day 5',
  },
  {
    id: 6,
    name: 'Koh Rong Island Day Trip',
    price: 45,
    guests: 2,
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800',
    date: 'Day 6',
  },
];
