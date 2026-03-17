<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class BookingController extends Controller
{
    private function ensureRole(Request $request, array $roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return null;
    }

    private function resolveUserFromBearerToken(Request $request)
    {
        $token = $request->bearerToken();
        if (! $token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if (! $accessToken) {
            return null;
        }

        $tokenable = $accessToken->tokenable;

        return $tokenable instanceof \App\Models\User ? $tokenable : null;
    }

    /**
     * Get all bookings (for owner page)
     */
    public function index(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            Log::info('Fetching bookings with filters:', $request->all());
            
            $query = Booking::query()->with(['user:id,name,email,role']);

            // Apply filters
            if ($request->has('service') && $request->service && $request->service !== 'all') {
                $query->where('category', $request->service);
            }

            if ($request->has('status') && $request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('min_amount') && $request->min_amount !== null && $request->min_amount !== '') {
                $query->where('amount', '>=', $request->min_amount);
            }

            if ($request->has('max_amount') && $request->max_amount !== null && $request->max_amount !== '') {
                $query->where('amount', '<=', $request->max_amount);
            }

            if ($request->has('guest_name') && $request->guest_name) {
                $query->where('guest', 'like', '%' . $request->guest_name . '%');
            }

            if ($request->has('booking_id') && $request->booking_id) {
                $query->where('id', 'like', '%' . $request->booking_id . '%');
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('guest', 'like', "%{$search}%")
                      ->orWhere('service', 'like', "%{$search}%")
                      ->orWhere('route', 'like', "%{$search}%")
                      ->orWhere('customerEmail', 'like', "%{$search}%");
                });
            }

            if ($request->has('date_range') && $request->date_range !== 'all') {
                $days = $request->date_range === 'last7' ? 7 : 
                       ($request->date_range === 'last3' ? 3 : 1);
                $cutoff = now()->subDays($days);
                $query->where('createdAt', '>=', $cutoff);
            }

            $bookings = $query->orderBy('createdAt', 'desc')->get();

            Log::info('Found ' . $bookings->count() . ' bookings');

            return response()->json([
                'success' => true,
                'data' => $bookings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get bookings for the authenticated customer
     */
    public function myBookings(Request $request)
    {
        try {
            $user = $request->user();

            $bookings = Booking::query()
                ->with(['user:id,name,email,role'])
                ->where('user_id', $user->id)
                ->orderBy('createdAt', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching customer bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get bookings by customer ID (restricted to the authenticated customer or admin)
     */
    public function customerBookings(Request $request, $customerId)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((string) $user->id !== (string) $customerId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $bookings = Booking::query()
                ->with(['user:id,name,email,role'])
                ->where('user_id', $customerId)
                ->orderBy('createdAt', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings by customer: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Create a new booking (when user books)
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== NEW BOOKING RECEIVED ===');
            Log::info('Booking data:', $request->all());

            $user = $request->user() ?? $this->resolveUserFromBearerToken($request);
            $category = (string) $request->input('category', '');
            $isTripBooking = $category === 'trip';
            
            $validator = Validator::make($request->all(), [
                'id' => 'required|string|unique:bookings,id',
                'guest' => $user ? 'nullable|string' : 'required|string',
                'service' => 'required|string',
                'route' => 'required|string',
                'pax' => 'required|integer|min:1',
                'amount' => 'nullable|numeric|min:0',
                'status' => 'required|string',
                'category' => 'required|in:hotel,transport,trip',
                'customerEmail' => $user ? 'nullable|email' : 'required|email',
                'customerPhone' => $user ? 'nullable|string' : 'required|string',
                'destination_id' => $isTripBooking ? 'required|integer|min:1' : 'nullable|integer|min:1',
                'transport_id' => $isTripBooking ? 'required|integer|min:1' : 'nullable|integer|min:1',
                'travel_date' => $isTripBooking ? 'required|date' : 'nullable|date',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Add user_id if user is authenticated
            $data = $request->all();
            if (isset($data['travel_date']) && (! isset($data['date']) || ! $data['date'])) {
                $data['date'] = $data['travel_date'];
            }
            if (! isset($data['amount']) || $data['amount'] === null || $data['amount'] === '') {
                $data['amount'] = 0;
            }
            if ($user) {
                $data['user_id'] = $user->id;

                // Ensure booking "guest" matches the authenticated user's name
                if (isset($user->name) && $user->name) {
                    $data['guest'] = $user->name;
                }
            }

            if (! isset($data['createdAt']) || ! $data['createdAt']) {
                $data['createdAt'] = now()->toIso8601String();
            }

            // Create booking
            $booking = Booking::create($data);

            Log::info('Booking saved successfully! ID: ' . $booking->id);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'data' => $booking
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking statistics for dashboard
     */
    public function stats(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $totalBookings = Booking::count();
            $activeGuests = Booking::where('status', 'paid')->sum('pax');
            $pendingPayments = Booking::where('status', 'pending')->sum('amount');

            return response()->json([
                'total_bookings' => number_format($totalBookings),
                'active_guests' => (string)$activeGuests,
                'pending_payments' => '$' . number_format($pendingPayments, 2)
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stats: ' . $e->getMessage());
            return response()->json([
                'total_bookings' => '0',
                'active_guests' => '0',
                'pending_payments' => '$0'
            ]);
        }
    }

    /**
     * Export bookings to CSV
     */
    public function export(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $query = Booking::query();

            if ($request->has('service') && $request->service && $request->service !== 'all') {
                $query->where('category', $request->service);
            }

            $bookings = $query->orderBy('createdAt', 'desc')->get();

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="bookings-' . date('Y-m-d') . '.csv"',
            ];

            $callback = function() use ($bookings) {
                $file = fopen('php://output', 'w');
                
                // Add headers
                fputcsv($file, ['Booking ID', 'Guest Name', 'Service', 'Route', 'Date', 'Pax', 'Amount', 'Status', 'Email', 'Phone']);
                
                // Add data
                foreach ($bookings as $booking) {
                    $dateInfo = $booking->category === 'hotel' 
                        ? ($booking->dateStart ? $booking->dateStart . ' to ' . $booking->dateEnd : '')
                        : ($booking->date ? $booking->date . ' ' . $booking->time : '');
                        
                    fputcsv($file, [
                        $booking->id,
                        $booking->guest,
                        $booking->service,
                        $booking->route,
                        $dateInfo,
                        $booking->pax,
                        '$' . number_format($booking->amount, 2),
                        ucfirst($booking->status),
                        $booking->customerEmail,
                        $booking->customerPhone,
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Export failed'
            ], 500);
        }
    }

    /**
     * Update booking status
     */
    public function updateStatus(Request $request, $id)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $booking = Booking::find($id);
            
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found'
                ], 404);
            }

            $booking->status = $request->status;
            $booking->save();

            Log::info('Booking status updated: ' . $id . ' to ' . $request->status);

            return response()->json([
                'success' => true,
                'message' => 'Booking status updated',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status'
            ], 500);
        }
    }
}
