<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\User;
use Illuminate\Database\Seeder;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('role', 'owner')->firstOrFail();

        $hotels = [
            [
                'hotel_name' => 'Sokha Beach Resort',
                'city' => 'Sihanoukville',
                'country' => 'Cambodia',
                'address' => '2 Thnour Street, Victory Beach',
                'description' => 'Luxury beachfront resort with private beach access.',
                'stars_rating' => 4.5,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'hotel_name' => 'Raffles Hotel Le Royal',
                'city' => 'Phnom Penh',
                'country' => 'Cambodia',
                'address' => '92 Rithirong Boulevard, Sangkat Wat Phnom',
                'description' => 'Historic colonial-era luxury hotel in the heart of the city.',
                'stars_rating' => 4.7,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'hotel_name' => 'Templation Hotel',
                'city' => 'Siem Reap',
                'country' => 'Cambodia',
                'address' => 'Khum Svay Dangkum, Steung Thmey',
                'description' => 'Boutique hotel near Angkor Wat with tropical gardens.',
                'stars_rating' => 4.3,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1584132967334-10e028bd69c5?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'hotel_name' => 'Koh Rong Sandy Beach Resort',
                'city' => 'Koh Rong',
                'country' => 'Cambodia',
                'address' => 'Koh Rong Island, Preah Sihanouk',
                'description' => 'Eco-friendly beach bungalows on a pristine island.',
                'stars_rating' => 4.2,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'hotel_name' => 'Amanjaya Pancam Suites Hotel',
                'city' => 'Kampot',
                'country' => 'Cambodia',
                'address' => 'Riverside Road, Kampot City',
                'description' => 'Riverside boutique hotel with mountain views.',
                'stars_rating' => 4.4,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&q=80&w=800',
            ],
        ];

        foreach ($hotels as $hotelData) {
            Accommodation::updateOrCreate(
                ['hotel_name' => $hotelData['hotel_name']],
                array_merge($hotelData, ['owner_id' => $owner->id])
            );
        }
    }
}
?>

