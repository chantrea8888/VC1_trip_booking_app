<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;

class HotelController extends Controller
{
    /**
     * Public list of all active destinations (used as hotels for customers)
     */
    public function index()
    {
        $destinations = Destination::query()
            ->where('status', 'active')
            ->with(['user:id,name,email'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($destination) {
                return [
                    'id' => $destination->id,
                    'name' => $destination->name,
                    'hotel_name' => $destination->name,
                    'location' => $destination->location,
                    'city' => $destination->location,
                    'country' => 'Cambodia',
                    'price' => floatval($destination->price),
                    'rating' => floatval($destination->rating ?? 0),
                    'stars_rating' => floatval($destination->rating ?? 0),
                    'image' => $destination->image,
                    'description' => $destination->description,
                    'address' => $destination->address ?? $destination->location,
                    'type' => $destination->type,
                    'amenities' => ['WiFi', 'Pool', 'Restaurant'],
                    'rooms' => 50,
                    'available' => true,
                    'is_active' => true,
                    'owner' => $destination->user ? [
                        'id' => $destination->user->id,
                        'name' => $destination->user->name,
                        'email' => $destination->user->email,
                    ] : null,
                    'created_at' => $destination->created_at,
                    'total_bookings' => $destination->total_bookings ?? 0,
                ];
            });

        return response()->json($destinations);
    }
}
