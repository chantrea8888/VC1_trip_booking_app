<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run()
    {
        $testUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => 'admin123',
                'role' => 'admin',
            ],
            [
                'name' => 'Customer User',
                'email' => 'customer@example.com',
                'password' => 'customer123',
                'role' => 'customer',
            ],
            [
                'name' => 'Owner User',
                'email' => 'owner@example.com',
                'password' => 'owner123',
                'role' => 'owner',
            ],
        ];

        foreach ($testUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'role' => $userData['role'],
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('Test users created successfully!');
    }
}
