<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\AppNotification;
use App\Models\OwnerNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\PersonalAccessToken;

class BookingController extends Controller
{
    private function bookingHistoryColumns(): array
    {
        static $columns = null;

        if ($columns === null) {
            try {
                $columns = Schema::getColumnListing('booking_history');
            } catch (\Throwable $e) {
                $columns = [];
            }
        }

        return $columns;
    }

    private function hasBookingHistoryColumn(string $column): bool
    {
        return in_array($column, $this->bookingHistoryColumns(), true);
    }

    private function bookingHistoryTableExists(): bool
    {
        try {
            return Schema::hasTable('booking_history');
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function safeIntFromBookingCode(string $bookingCode): int
    {
        // Prefer numeric portion from "BK-<digits>-xxxx", but keep it safely within signed INT range.
        if (preg_match('/BK-(\d+)/', $bookingCode, $m)) {
            $digits = $m[1];
            // If it's already small enough, use it directly.
            if (strlen($digits) <= 9) {
                return max(1, (int) $digits);
            }
        }

        // Stable fallback: CRC32 reduced to <= 2,000,000,000 to fit signed INT columns.
        $unsigned = (int) sprintf('%u', crc32($bookingCode));
        $bounded = $unsigned % 2000000000;
        return $bounded > 0 ? $bounded : 1;
    }

    private function formatTravelDate(?string $dateStart, ?string $dateEnd, ?string $date, ?string $time): ?string
    {
        $dateStart = $dateStart ? trim($dateStart) : null;
        $dateEnd = $dateEnd ? trim($dateEnd) : null;
        $date = $date ? trim($date) : null;
        $time = $time ? trim($time) : null;

        if ($dateStart && $dateEnd) {
            return $dateStart . ' to ' . $dateEnd;
        }

        if ($dateStart) {
            return $dateStart;
        }

        if ($date && $time) {
            return $date . ' ' . $time;
        }

        return $date;
    }

    private function writeBookingHistoryRow(Booking $booking): void
    {
        if (! $this->bookingHistoryTableExists()) {
            return;
        }

        try {
            $bookingCode = (string) $booking->id;
            $bookingId = $this->safeIntFromBookingCode($bookingCode);

            $dateStart = $booking->date_start ?? $booking->dateStart ?? null;
            $dateEnd = $booking->date_end ?? $booking->dateEnd ?? null;
            $date = $booking->date ?? null;
            $time = $booking->time ?? null;

            $destination = trim((string) ($booking->service ?? ''));
            if ($destination === '') {
                $destination = '-';
            }

            $travelDate = $this->formatTravelDate(
                is_string($dateStart) ? $dateStart : null,
                is_string($dateEnd) ? $dateEnd : null,
                is_string($date) ? $date : null,
                is_string($time) ? $time : null,
            );
            $travelDate = $travelDate ? trim($travelDate) : '';
            if ($travelDate === '') {
                $travelDate = '-';
            }

            $row = [
                'booking_id' => $bookingId,
                'user_id' => (int) $booking->user_id,
                'booking_code' => $bookingCode,
                'destination' => $destination,
                'travel_date' => $travelDate,
                'travelers' => (int) ($booking->pax ?? 0),
                'amount' => (float) ($booking->amount ?? 0),
                'status' => (string) ($booking->status ?? 'pending'),
            ];

            // Optional columns (some DBs added these later)
            if ($this->hasBookingHistoryColumn('customer_name') || $this->hasBookingHistoryColumn('customer_email')) {
                $customerName = trim((string) ($booking->guest ?? ''));
                $customerEmail = trim((string) (($booking->customer_email ?? $booking->customerEmail) ?? ''));

                if (($customerName === '' || $customerEmail === '') && $booking->user_id) {
                    try {
                        $user = $booking->relationLoaded('user')
                            ? $booking->user
                            : User::query()->find($booking->user_id, ['id', 'name', 'email']);

                        if ($user) {
                            if ($customerName === '') $customerName = trim((string) ($user->name ?? ''));
                            if ($customerEmail === '') $customerEmail = trim((string) ($user->email ?? ''));
                        }
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                if ($this->hasBookingHistoryColumn('customer_name')) {
                    $row['customer_name'] = $customerName !== '' ? $customerName : null;
                }
                if ($this->hasBookingHistoryColumn('customer_email')) {
                    $row['customer_email'] = $customerEmail !== '' ? $customerEmail : null;
                }
            }

            $exists = DB::table('booking_history')
                ->where('booking_code', $bookingCode)
                ->where('user_id', (int) $booking->user_id)
                ->exists();

            if ($exists) {
                DB::table('booking_history')
                    ->where('booking_code', $bookingCode)
                    ->where('user_id', (int) $booking->user_id)
                    ->update($row);
            } else {
                $row['created_at'] = $booking->created_at ?? now();
                DB::table('booking_history')->insert($row);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to write booking_history row: ' . $e->getMessage());
        }
    }

    private function hasBookingColumn(string $column): bool
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::getColumnListing('bookings');
        }

        return in_array($column, $columns, true);
    }

    private function toFrontendBooking(Booking $booking): array
    {
        $createdAt = $booking->created_at
            ? $booking->created_at->toIso8601String()
            : ($booking->createdAt ? $booking->createdAt->toIso8601String() : null);

        return [
            'id' => $booking->id,
            'guest' => $booking->guest,
            'service' => $booking->service,
            'route' => $booking->route,
            'category' => $booking->category,
            'dateStart' => $booking->date_start ?? $booking->dateStart,
            'dateEnd' => $booking->date_end ?? $booking->dateEnd,
            'date' => $booking->date,
            'time' => $booking->time,
            'pax' => $booking->pax,
            'amount' => $booking->amount,
            'status' => $booking->status,
            'roomType' => $booking->room_type ?? $booking->roomType,
            'vehicleType' => $booking->vehicle_type ?? $booking->vehicleType,
            'customerEmail' => $booking->customer_email ?? $booking->customerEmail,
            'customerPhone' => $booking->customer_phone ?? $booking->customerPhone,
            'specialRequests' => $booking->special_requests ?? $booking->specialRequests,
            'paymentMethod' => $booking->payment_method ?? $booking->paymentMethod,
            'createdAt' => $createdAt,
            // Extras (safe to ignore by the UI if unused)
            'guests' => $booking->guests,
            'nights' => $booking->nights,
            'totalAmount' => $booking->total_amount,
            'rental' => $booking->rental,
            'activities' => $booking->activities,
            'reference' => $booking->reference,
            'user_id' => $booking->user_id,
            'destination_id' => $booking->destination_id,
            'transport_id' => $booking->transport_id,
            'user' => $booking->relationLoaded('user') ? $booking->user : null,
        ];
    }
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
                      ->orWhere('customer_email', 'like', "%{$search}%");

                    // Legacy column (older schema)
                    if ($this->hasBookingColumn('customerEmail')) {
                        $q->orWhere('customerEmail', 'like', "%{$search}%");
                    }
                });
            }

            if ($request->has('date_range') && $request->date_range !== 'all') {
                $days = $request->date_range === 'last7' ? 7 : 
                       ($request->date_range === 'last3' ? 3 : 1);
                $cutoff = now()->subDays($days);
                $query->where(function ($q) use ($cutoff) {
                    $q->where('created_at', '>=', $cutoff);

                    // Legacy column (older schema)
                    if ($this->hasBookingColumn('createdAt')) {
                        $q->orWhere('createdAt', '>=', $cutoff);
                    }
                });
            }

            $query->orderByDesc('created_at');
            if ($this->hasBookingColumn('createdAt')) {
                $query->orderByDesc('createdAt');
            }

            $bookings = $query->get();

            Log::info('Found ' . $bookings->count() . ' bookings');

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
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
                ->orderByDesc('created_at');

            if ($this->hasBookingColumn('createdAt')) {
                $bookings->orderByDesc('createdAt');
            }

            $bookings = $bookings->get();

            // Lazy sync to booking_history so existing bookings appear in history without changing the frontend.
            foreach ($bookings as $booking) {
                $this->writeBookingHistoryRow($booking);
            }

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
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
                ->orderByDesc('created_at');

            if ($this->hasBookingColumn('createdAt')) {
                $bookings->orderByDesc('createdAt');
            }

            $bookings = $bookings->get();

            // Best-effort: keep booking_history in sync for this customer.
            foreach ($bookings as $booking) {
                $this->writeBookingHistoryRow($booking);
            }

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
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

            // Accept both camelCase (frontend) and snake_case (DB) field names.
            $payload = $request->all();
            $payload['customerEmail'] = $payload['customerEmail'] ?? $payload['customer_email'] ?? null;
            $payload['customerPhone'] = $payload['customerPhone'] ?? $payload['customer_phone'] ?? null;
            $payload['dateStart'] = $payload['dateStart'] ?? $payload['date_start'] ?? null;
            $payload['dateEnd'] = $payload['dateEnd'] ?? $payload['date_end'] ?? null;
            $payload['roomType'] = $payload['roomType'] ?? $payload['room_type'] ?? null;
            $payload['vehicleType'] = $payload['vehicleType'] ?? $payload['vehicle_type'] ?? null;
            $payload['paymentMethod'] = $payload['paymentMethod'] ?? $payload['payment_method'] ?? null;
            $payload['specialRequests'] = $payload['specialRequests'] ?? $payload['special_requests'] ?? null;
            $payload['totalAmount'] = $payload['totalAmount'] ?? $payload['total_amount'] ?? null;

            $validator = Validator::make($payload, [
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

            $amount = $payload['amount'] ?? 0;
            if ($amount === null || $amount === '') {
                $amount = 0;
            }

            $guestName = $payload['guest'] ?? null;
            if ($user && isset($user->name) && $user->name) {
                $guestName = $user->name;
            }

            $createdAtRaw = $payload['createdAt'] ?? $payload['created_at'] ?? null;
            $createdAt = $createdAtRaw ? \Illuminate\Support\Carbon::parse($createdAtRaw) : now();
            $createdAtIso = $createdAt->toIso8601String();

            $normalizeDate = function ($value): ?string {
                if ($value === null) return null;
                if (is_string($value) && trim($value) === '') return null;

                try {
                    return \Illuminate\Support\Carbon::parse($value)->toDateString();
                } catch (\Throwable $e) {
                    return is_string($value) ? trim($value) : null;
                }
            };

            $dateStartNormalized = $normalizeDate($payload['dateStart'] ?? null);
            $dateEndNormalized = $normalizeDate($payload['dateEnd'] ?? null);

            // Store into snake_case columns (matches the provided SQL schema),
            // while still accepting the frontend's camelCase payload.
            $data = [
                'id' => $payload['id'],
                'user_id' => $user ? $user->id : ($payload['user_id'] ?? null),
                'guest' => $guestName,
                'customer_email' => $payload['customerEmail'] ?? null,
                'customer_phone' => $payload['customerPhone'] ?? null,
                'customerEmail' => $payload['customerEmail'] ?? null,
                'customerPhone' => $payload['customerPhone'] ?? null,
                'service' => $payload['service'],
                'route' => $payload['route'],
                'category' => $payload['category'],
                'date_start' => $dateStartNormalized,
                'date_end' => $dateEndNormalized,
                'date' => $payload['date'] ?? ($payload['travel_date'] ?? null),
                'time' => $payload['time'] ?? null,
                'pax' => (int) ($payload['pax'] ?? 1),
                'guests' => $payload['guests'] ?? null,
                'nights' => $payload['nights'] ?? null,
                'room_type' => $payload['roomType'] ?? null,
                'vehicle_type' => $payload['vehicleType'] ?? null,
                'amount' => $amount,
                'total_amount' => $payload['totalAmount'] ?? null,
                'payment_method' => $payload['paymentMethod'] ?? null,
                'status' => $payload['status'],
                'rental' => $payload['rental'] ?? null,
                'activities' => $payload['activities'] ?? null,
                'reference' => $payload['reference'] ?? null,
                'special_requests' => $payload['specialRequests'] ?? null,
                'destination_id' => $payload['destination_id'] ?? null,
                'transport_id' => $payload['transport_id'] ?? null,
                'created_at' => $createdAt,
                'updated_at' => now(),
                // Keep legacy createdAt for older consumers (harmless if column exists)
                'createdAt' => $createdAtIso,
                // Also write legacy/camelCase date columns when present (some deployments use this schema).
                'dateStart' => $dateStartNormalized,
                'dateEnd' => $dateEndNormalized,
                'roomType' => $payload['roomType'] ?? null,
                'vehicleType' => $payload['vehicleType'] ?? null,
                'totalAmount' => $payload['totalAmount'] ?? null,
                'paymentMethod' => $payload['paymentMethod'] ?? null,
                'specialRequests' => $payload['specialRequests'] ?? null,
            ];

            // Not all deployments have the same `bookings` table columns (some use a pure MySQL schema).
            // Filter out any keys that don't exist to avoid "Unknown column" SQL errors.
            $allowed = array_flip(Schema::getColumnListing('bookings'));
            $data = array_intersect_key($data, $allowed);

            // Create booking
            $booking = Booking::create($data);

            Log::info('Booking saved successfully! ID: ' . $booking->id);

            // Write booking summary into booking_history table (best-effort; never fail booking creation).
            $this->writeBookingHistoryRow($booking);

            // Create owner/admin notifications (best-effort: never fail the booking request because of notifications)
            try {
                $snapshot = $this->toFrontendBooking($booking);

                // Enrich notification snapshot with images coming from the frontend payload.
                // These keys are used only for owner notifications UI and do not require DB columns.
                $snapshot['image'] = $payload['image'] ?? $payload['serviceImage'] ?? $payload['hotelImage'] ?? null;
                $snapshot['hotelImage'] = $payload['hotelImage'] ?? $payload['image'] ?? null;
                $snapshot['rentalImage'] = $payload['rentalImage'] ?? ($payload['rental']['image'] ?? null);

                $guest = (string) ($snapshot['guest'] ?? 'A customer');
                $service = (string) ($snapshot['service'] ?? 'a service');
                $route = (string) ($snapshot['route'] ?? '');
                $amount = (float) ($snapshot['amount'] ?? 0);

                $title = 'New booking: ' . $booking->id;
                $message = trim($guest . ' booked ' . $service . ($route ? ' (' . $route . ')' : '') . ' • $' . number_format($amount, 2));

                // Resolve owner recipients. Trip bookings can involve both a destination owner and a transport owner.
                $recipientUserIds = [];
                $transportId = $payload['transport_id'] ?? null;
                $destinationId = $payload['destination_id'] ?? null;
                $serviceName = trim((string) ($payload['service'] ?? ''));
                $routeName = trim((string) ($payload['route'] ?? ''));

                $activitiesTableExists = Schema::hasTable('recent_activities');
                $activitiesColumns = $activitiesTableExists ? Schema::getColumnListing('recent_activities') : [];

                if ($transportId) {
                    try {
                        $transportOwnerId = DB::table('transports')->where('transport_id', $transportId)->value('owner_id');
                        if ($transportOwnerId) $recipientUserIds[] = $transportOwnerId;
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                if ($destinationId) {
                    try {
                        $destinationOwnerId = DB::table('destinations')->where('destination_id', $destinationId)->value('user_id');
                        if ($destinationOwnerId) $recipientUserIds[] = $destinationOwnerId;
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                $recipientUserIds = array_values(array_unique(array_filter($recipientUserIds, fn ($id) => (bool) $id)));

                if (empty($recipientUserIds) && $serviceName !== '') {
                    try {
                        $hotelOwnerId = DB::table('hotels')->where('hotel_name', $serviceName)->value('owner_id');
                        if ($hotelOwnerId) $recipientUserIds[] = $hotelOwnerId;
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                if (empty($recipientUserIds) && $serviceName !== '') {
                    try {
                        $lower = strtolower($serviceName);
                        $destinationOwnerId = DB::table('destinations')
                            ->whereRaw('LOWER(name) = ?', [$lower])
                            ->value('user_id');
                        if ($destinationOwnerId) $recipientUserIds[] = $destinationOwnerId;
                    } catch (\Throwable $e) {
                        // ignore
                    }

                    if (empty($recipientUserIds)) {
                        try {
                            $lower = strtolower($serviceName);
                            $destinationOwnerId = DB::table('destinations')
                                ->whereRaw('LOWER(name) LIKE ?', ['%' . $lower . '%'])
                                ->orderByDesc('destination_id')
                                ->value('user_id');
                            if ($destinationOwnerId) $recipientUserIds[] = $destinationOwnerId;
                        } catch (\Throwable $e) {
                            // ignore
                        }
                    }

                    if (empty($recipientUserIds) && $routeName !== '') {
                        try {
                            $lowerRoute = strtolower($routeName);
                            $destinationOwnerId = DB::table('destinations')
                                ->whereRaw('LOWER(location) LIKE ?', ['%' . $lowerRoute . '%'])
                                ->orderByDesc('destination_id')
                                ->value('user_id');
                            if ($destinationOwnerId) $recipientUserIds[] = $destinationOwnerId;
                        } catch (\Throwable $e) {
                            // ignore
                        }
                    }
                }

                $recipientUserIds = array_values(array_unique(array_filter($recipientUserIds, fn ($id) => (bool) $id)));

                if (empty($recipientUserIds)) {
                    $fallbackOwnerId = User::query()->whereRaw('LOWER(role) = ?', ['owner'])->orderBy('id')->value('id');
                    if ($fallbackOwnerId) $recipientUserIds[] = $fallbackOwnerId;
                }

                if (empty($recipientUserIds)) {
                    $fallbackAdminId = User::query()->whereRaw('LOWER(role) = ?', ['admin'])->orderBy('id')->value('id');
                    if ($fallbackAdminId) $recipientUserIds[] = $fallbackAdminId;
                }

                try {
                    $numericBookingId = null;
                    if (is_string($booking->id)) {
                        if (preg_match('/BK-(\\d+)/', $booking->id, $m)) {
                            $numericBookingId = $m[1];
                        } elseif (preg_match('/(\\d{6,})/', $booking->id, $m)) {
                            $numericBookingId = $m[1];
                        }
                    }
                    if (! $numericBookingId) {
                        $numericBookingId = (string) (int) round(microtime(true) * 1000);
                    }

                    $notificationsTableExists = Schema::hasTable('notifications');
                    $notificationsColumns = $notificationsTableExists ? Schema::getColumnListing('notifications') : [];
                    $notificationsSchemaOk =
                        $notificationsTableExists &&
                        in_array('user_id', $notificationsColumns, true) &&
                        in_array('title', $notificationsColumns, true) &&
                        in_array('message', $notificationsColumns, true) &&
                        in_array('data', $notificationsColumns, true);

                    foreach ($recipientUserIds as $recipientUserId) {
                        if (! $recipientUserId) continue;

                        if ($notificationsSchemaOk) {
                            $unique = ['user_id' => $recipientUserId];
                            if (in_array('booking_id', $notificationsColumns, true)) $unique['booking_id'] = $numericBookingId;
                            if (in_array('type', $notificationsColumns, true)) $unique['type'] = 'new_booking';

                            $values = [
                                'user_id' => $recipientUserId,
                                'title' => $title,
                                'message' => $message,
                                'data' => $snapshot,
                            ];
                            if (in_array('booking_id', $notificationsColumns, true)) $values['booking_id'] = $numericBookingId;
                            if (in_array('type', $notificationsColumns, true)) $values['type'] = 'new_booking';
                            if (in_array('is_read', $notificationsColumns, true)) $values['is_read'] = false;
                            if (in_array('read_at', $notificationsColumns, true)) $values['read_at'] = null;
                            if (in_array('updated_at', $notificationsColumns, true)) $values['updated_at'] = now();
                            if (in_array('created_at', $notificationsColumns, true)) $values['created_at'] = now();

                            DB::table('notifications')->updateOrInsert($unique, $values);
                        }

                        OwnerNotification::firstOrCreate(
                            [
                                'user_id' => $recipientUserId,
                                'booking_id' => (string) $booking->id,
                                'title' => $title,
                            ],
                            [
                                'message' => $message,
                                'data' => $snapshot,
                                'read_at' => null,
                            ],
                        );

                        if ($activitiesTableExists) {
                            try {
                                $activity = [];
                                if (in_array('booking_id', $activitiesColumns, true)) $activity['booking_id'] = (string) $booking->id;
                                if (in_array('user_id', $activitiesColumns, true)) $activity['user_id'] = $recipientUserId;
                                if (in_array('notification_id', $activitiesColumns, true)) $activity['notification_id'] = null;
                                if (in_array('activity_type', $activitiesColumns, true)) $activity['activity_type'] = 'new_booking';
                                if (in_array('title', $activitiesColumns, true)) $activity['title'] = $title;
                                if (in_array('description', $activitiesColumns, true)) $activity['description'] = $message;
                                if (in_array('activity_data', $activitiesColumns, true)) $activity['activity_data'] = json_encode($snapshot);
                                if (in_array('ip_address', $activitiesColumns, true)) $activity['ip_address'] = $request->ip();
                                if (in_array('user_agent', $activitiesColumns, true)) $activity['user_agent'] = $request->userAgent();
                                if (in_array('created_at', $activitiesColumns, true)) $activity['created_at'] = now();

                                DB::table('recent_activities')->insert($activity);
                            } catch (\Throwable $e) {
                                // ignore activity insert failures
                            }
                        }
                    }
                } catch (\Throwable $inner) {
                    Log::error('Failed to write owner notification: ' . $inner->getMessage());
                }
            } catch (\Throwable $e) {
                Log::error('Failed to create owner notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'data' => $this->toFrontendBooking($booking)
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

            $query->orderByDesc('created_at');
            if ($this->hasBookingColumn('createdAt')) {
                $query->orderByDesc('createdAt');
            }

            $bookings = $query->get();
            $rows = $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b));

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="bookings-' . date('Y-m-d') . '.csv"',
            ];

            $callback = function() use ($rows) {
                $file = fopen('php://output', 'w');
                
                // Add headers
                fputcsv($file, ['Booking ID', 'Guest Name', 'Service', 'Route', 'Date', 'Pax', 'Amount', 'Status', 'Email', 'Phone']);
                
                // Add data
                foreach ($rows as $booking) {
                    $dateInfo = ($booking['category'] ?? '') === 'hotel'
                        ? (($booking['dateStart'] ?? '') ? ($booking['dateStart'] . ' to ' . ($booking['dateEnd'] ?? '')) : '')
                        : (($booking['date'] ?? '') ? ($booking['date'] . ' ' . ($booking['time'] ?? '')) : '');
                        
                    fputcsv($file, [
                        $booking['id'] ?? '',
                        $booking['guest'] ?? '',
                        $booking['service'] ?? '',
                        $booking['route'] ?? '',
                        $dateInfo,
                        $booking['pax'] ?? 0,
                        '$' . number_format((float) ($booking['amount'] ?? 0), 2),
                        ucfirst((string) ($booking['status'] ?? 'pending')),
                        $booking['customerEmail'] ?? '',
                        $booking['customerPhone'] ?? '',
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

            // Keep booking_history in sync (best-effort).
            $this->writeBookingHistoryRow($booking);

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
