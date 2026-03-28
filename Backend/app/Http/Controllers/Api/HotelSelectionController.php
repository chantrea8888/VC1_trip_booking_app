<?php

namespace App\Http\Controllers\Api;

use App\Models\HotelSelection;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class HotelSelectionController extends Controller
{
    /**
     * Get all hotel selections for the authenticated customer
     */
    public function index()
    {
        $selections = HotelSelection::byCustomer(Auth::id())
            ->with(['hotel', 'customer', 'booking'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($selections);
    }

    /**
     * Store a new hotel selection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_rooms' => 'required|integer|min:1',
            'number_of_guests' => 'required|integer|min:1',
            'room_type' => 'nullable|string|max:100',
            'special_requests' => 'nullable|string|max:500',
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        $validated['customer_id'] = Auth::id();

        // Calculate total price if needed (based on hotel pricing)
        $hotel = Accommodation::find($validated['hotel_id']);
        $nights = \Carbon\Carbon::parse($validated['check_out_date'])
            ->diffInDays(\Carbon\Carbon::parse($validated['check_in_date']));
        
        $validated['total_price'] = $nights * $validated['number_of_rooms'] * 100; // Base price per room per night

        $selection = HotelSelection::create($validated);

        return response()->json($selection, 201);
    }

    /**
     * Show a specific hotel selection
     */
    public function show(HotelSelection $hotelSelection)
    {
        // Check if customer owns this selection
        if ($hotelSelection->customer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hotelSelection->load(['hotel', 'customer', 'booking']);

        return response()->json($hotelSelection);
    }

    /**
     * Update a hotel selection
     */
    public function update(Request $request, HotelSelection $hotelSelection)
    {
        // Check if customer owns this selection
        if ($hotelSelection->customer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'hotel_id' => 'exists:hotels,id',
            'check_in_date' => 'date|after_or_equal:today',
            'check_out_date' => 'date|after:check_in_date',
            'number_of_rooms' => 'integer|min:1',
            'number_of_guests' => 'integer|min:1',
            'room_type' => 'nullable|string|max:100',
            'special_requests' => 'nullable|string|max:500',
            'status' => 'in:pending,confirmed,cancelled,completed',
        ]);

        $hotelSelection->update($validated);

        return response()->json($hotelSelection);
    }

    /**
     * Delete a hotel selection
     */
    public function destroy(HotelSelection $hotelSelection)
    {
        // Check if customer owns this selection
        if ($hotelSelection->customer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hotelSelection->delete();

        return response()->json(['message' => 'Hotel selection deleted']);
    }

    /**
     * Get available hotel selections by status
     */
    public function getByStatus(Request $request)
    {
        $status = $request->query('status', 'pending');

        $selections = HotelSelection::byCustomer(Auth::id())
            ->where('status', $status)
            ->with(['hotel', 'booking'])
            ->get();

        return response()->json($selections);
    }

    /**
     * Confirm a hotel selection
     */
    public function confirm(HotelSelection $hotelSelection)
    {
        if ($hotelSelection->customer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hotelSelection->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Hotel selection confirmed',
            'data' => $hotelSelection
        ]);
    }

    /**
     * Cancel a hotel selection
     */
    public function cancel(HotelSelection $hotelSelection)
    {
        if ($hotelSelection->customer_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hotelSelection->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Hotel selection cancelled',
            'data' => $hotelSelection
        ]);
    }
}
