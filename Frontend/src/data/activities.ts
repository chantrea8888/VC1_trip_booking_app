import { format, addDays } from 'date-fns';

const today = new Date('2026-03-03T00:34:03-08:00');

export const AVAILABLE_ACTIVITIES = [
  {
    id: 1,
    name: "Angkor Wat Sunrise Guided Tour",
    date: `${format(addDays(today, 9), 'MMMM d, yyyy')} • 05:00`,
    price: 85.00,
    guests: 2,
    image: "https://images.unsplash.com/photo-1544013587-41428e7177e9?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "Phare, The Cambodian Circus",
    date: `${format(addDays(today, 11), 'MMMM d, yyyy')} • 19:30`,
    price: 35.00,
    guests: 2,
    image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "Surfing Lesson in Kuta",
    date: `${format(addDays(today, 12), 'MMMM d, yyyy')} • 09:00`,
    price: 45.00,
    guests: 2,
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "Mondulkiri Elephant Trek",
    date: `${format(addDays(today, 13), 'MMMM d, yyyy')} • 08:30`,
    price: 120.00,
    guests: 2,
    image: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&q=80&w=400"
  }
];
