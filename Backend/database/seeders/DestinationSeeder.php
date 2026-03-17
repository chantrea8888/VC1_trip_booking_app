<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first owner user or use a default user_id
        $userId = DB::table('users')->where('role', 'owner')->first()?->id ?? 1;

        $destinations = [
            [
                'user_id' => $userId,
                'name' => 'Mekong Riverside Villa',
                'type' => 'Villa',
                'description' => 'A beautiful riverside villa with stunning views of the Mekong River',
                'location' => 'Phnom Penh, Cambodia',
                'address' => '123 Riverside Road, Chroy Changvar',
                'price' => 185.00,
                'image' => 'https://picsum.photos/seed/villa1/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa1/800/600',
                    'https://picsum.photos/seed/villa1b/800/600'
                ]),
                'rating' => 4.9,
                'total_bookings' => 24,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'name' => 'Koh Rong Luxury Retreat',
                'type' => 'Resort',
                'description' => 'Luxury beachfront retreat on the beautiful island of Koh Rong',
                'location' => 'Koh Rong, Sihanoukville',
                'address' => 'Beach Road, Koh Rong',
                'price' => 340.00,
                'image' => 'https://picsum.photos/seed/villa2/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa2/800/600',
                    'https://picsum.photos/seed/villa2b/800/600'
                ]),
                'rating' => 4.8,
                'total_bookings' => 18,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'name' => 'Siem Reap Boutique Stay',
                'type' => 'Boutique Hotel',
                'description' => 'Charming boutique hotel in the heart of Siem Reap',
                'location' => 'Siem Reap City Center',
                'address' => '456 Angkor Avenue',
                'price' => 120.00,
                'image' => 'https://picsum.photos/seed/villa3/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa3/800/600',
                    'https://picsum.photos/seed/villa3b/800/600'
                ]),
                'rating' => 0,
                'total_bookings' => 0,
                'status' => 'draft',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'name' => 'Kampot Pepper Farm Villa',
                'type' => 'Villa',
                'description' => 'Peaceful villa surrounded by pepper farms in rural Kampot',
                'location' => 'Kampot, Rural Area',
                'address' => 'Rural Road 7, Kampot Province',
                'price' => 155.00,
                'image' => 'https://picsum.photos/seed/villa4/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa4/800/600',
                    'https://picsum.photos/seed/villa4b/800/600'
                ]),
                'rating' => 4.7,
                'total_bookings' => 12,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'name' => 'Mondulkiri Eco Lodge',
                'type' => 'Eco Lodge',
                'description' => 'Sustainable eco-lodge in the forests of Mondulkiri',
                'location' => 'Sen Monorom, Mondulkiri',
                'address' => 'Forest Road, Sen Monorom',
                'price' => 95.00,
                'image' => 'https://picsum.photos/seed/villa5/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa5/800/600',
                    'https://picsum.photos/seed/villa5b/800/600'
                ]),
                'rating' => 4.9,
                'total_bookings' => 31,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $userId,
                'name' => 'Cardamom Tented Camp',
                'type' => 'Camp',
                'description' => 'Unique tented camp experience in the Koh Kong forest',
                'location' => 'Koh Kong Forest',
                'address' => 'Protected Area, Koh Kong',
                'price' => 210.00,
                'image' => 'https://picsum.photos/seed/villa6/800/600',
                'images' => json_encode([
                    'https://picsum.photos/seed/villa6/800/600',
                    'https://picsum.photos/seed/villa6b/800/600'
                ]),
                'rating' => 0,
                'total_bookings' => 0,
                'status' => 'draft',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($destinations as $destination) {
            Destination::create($destination);
        }
    }
}

