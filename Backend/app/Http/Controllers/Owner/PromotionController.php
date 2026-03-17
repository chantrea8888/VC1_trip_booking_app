<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Promotion;
use App\Models\Transport;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PromotionController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $promotions = Promotion::where('owner_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $promotions = $promotions->map(function ($promotion) use ($userId) {
            $promotion->service_category = $this->normalizeCategory($promotion->service_category);
            [$serviceId, $serviceName] = $this->resolveServiceTarget($promotion, $userId);
            $promotion->service_id = $serviceId;
            $promotion->service_name = $serviceName;
            return $promotion;
        });

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount' => 'required|string',
            'type' => 'required|string',
            'expiry' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'service_category' => 'nullable|string|in:destination,room,transport,hotel',
            'destination_id' => 'nullable|integer',
            'room_id' => 'nullable|integer',
            'transport_id' => 'nullable|integer',
        ]);

        if (!Schema::hasColumn('promotions', 'service_category')) {
            unset($validated['service_category']);
        }

        $validated['owner_id'] = auth()->id();
        if (Schema::hasColumn('promotions', 'service_category') && !isset($validated['service_category'])) {
            $validated['service_category'] = 'destination';
        }

        if (Schema::hasColumn('promotions', 'service_category')) {
            $validated['service_category'] = $this->normalizeCategory($validated['service_category']);
            $this->enforceServiceTarget($validated, auth()->id());
        } else {
            unset($validated['destination_id'], $validated['room_id'], $validated['transport_id']);
        }

        $promotion = Promotion::create($validated);
        $promotion->service_category = $this->normalizeCategory($promotion->service_category);
        [$serviceId, $serviceName] = $this->resolveServiceTarget($promotion, auth()->id());
        $promotion->service_id = $serviceId;
        $promotion->service_name = $serviceName;

        return response()->json([
            'success' => true,
            'message' => 'Promotion created successfully',
            'data' => $promotion
        ], 201);
    }

    public function show(string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)->findOrFail($id);
        $promotion->service_category = $this->normalizeCategory($promotion->service_category);
        [$serviceId, $serviceName] = $this->resolveServiceTarget($promotion, $userId);
        $promotion->service_id = $serviceId;
        $promotion->service_name = $serviceName;

        return response()->json([
            'success' => true,
            'data' => $promotion
        ]);
    }

    public function update(Request $request, string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'discount' => 'sometimes|string',
            'type' => 'sometimes|string',
            'expiry' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'service_category' => 'nullable|string|in:destination,room,transport,hotel',
            'destination_id' => 'nullable|integer',
            'room_id' => 'nullable|integer',
            'transport_id' => 'nullable|integer',
        ]);

        if (!Schema::hasColumn('promotions', 'service_category')) {
            unset($validated['service_category']);
        }

        if (Schema::hasColumn('promotions', 'service_category') && array_key_exists('service_category', $validated)) {
            $validated['service_category'] = $this->normalizeCategory($validated['service_category']);
        }

        if (Schema::hasColumn('promotions', 'service_category')) {
            $this->enforceServiceTarget($validated, $userId, $promotion);
        } else {
            unset($validated['destination_id'], $validated['room_id'], $validated['transport_id']);
        }

        $promotion->update($validated);
        $promotion->service_category = $this->normalizeCategory($promotion->service_category);
        [$serviceId, $serviceName] = $this->resolveServiceTarget($promotion, $userId);
        $promotion->service_id = $serviceId;
        $promotion->service_name = $serviceName;

        return response()->json([
            'success' => true,
            'message' => 'Promotion updated successfully',
            'data' => $promotion
        ]);
    }

    public function destroy(string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)->findOrFail($id);

        $promotion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promotion deleted successfully'
        ]);
    }

    private function normalizeCategory(?string $category): string
    {
        $value = strtolower(trim($category ?? ''));
        if ($value === 'hotel') {
            return 'destination';
        }
        if (in_array($value, ['destination', 'room', 'transport'], true)) {
            return $value;
        }
        return 'destination';
    }

    private function enforceServiceTarget(array &$validated, int $userId, ?Promotion $existing = null): void
    {
        $category = $this->normalizeCategory($validated['service_category'] ?? $existing?->service_category);
        $validated['service_category'] = $category;

        $destinationId = $validated['destination_id'] ?? $existing?->destination_id;
        $roomId = $validated['room_id'] ?? $existing?->room_id;
        $transportId = $validated['transport_id'] ?? $existing?->transport_id;

        if ($category === 'destination') {
            if (! $destinationId) {
                abort(response()->json(['message' => 'destination_id is required for destination promotions.'], 422));
            }
            $exists = Destination::where('destination_id', $destinationId)
                ->where('user_id', $userId)
                ->exists();
            if (! $exists) {
                abort(response()->json(['message' => 'Destination not found for this owner.'], 422));
            }
            $validated['destination_id'] = $destinationId;
            $validated['room_id'] = null;
            $validated['transport_id'] = null;
            return;
        }

        if ($category === 'transport') {
            if (! $transportId) {
                abort(response()->json(['message' => 'transport_id is required for transport promotions.'], 422));
            }
            $exists = Transport::where('transport_id', $transportId)
                ->where('owner_id', $userId)
                ->exists();
            if (! $exists) {
                abort(response()->json(['message' => 'Transport not found for this owner.'], 422));
            }
            $validated['transport_id'] = $transportId;
            $validated['destination_id'] = null;
            $validated['room_id'] = null;
            return;
        }

        if ($category === 'room') {
            if (! $roomId) {
                abort(response()->json(['message' => 'room_id is required for room promotions.'], 422));
            }
            $exists = DB::table('rooms')
                ->join('hotels', 'rooms.hotel_id', '=', 'hotels.id')
                ->where('rooms.id', $roomId)
                ->where('hotels.owner_id', $userId)
                ->exists();
            if (! $exists) {
                abort(response()->json(['message' => 'Room not found for this owner.'], 422));
            }
            $validated['room_id'] = $roomId;
            $validated['destination_id'] = null;
            $validated['transport_id'] = null;
        }
    }

    private function resolveServiceTarget(Promotion $promotion, int $userId): array
    {
        $category = $this->normalizeCategory($promotion->service_category);
        if ($category === 'destination' && $promotion->destination_id) {
            $destination = Destination::where('destination_id', $promotion->destination_id)
                ->where('user_id', $userId)
                ->first();
            return [$promotion->destination_id, $destination?->name];
        }
        if ($category === 'transport' && $promotion->transport_id) {
            $transport = Transport::where('transport_id', $promotion->transport_id)
                ->where('owner_id', $userId)
                ->first();
            return [$promotion->transport_id, $transport?->service_name];
        }
        if ($category === 'room' && $promotion->room_id) {
            $room = DB::table('rooms')
                ->join('hotels', 'rooms.hotel_id', '=', 'hotels.id')
                ->where('rooms.id', $promotion->room_id)
                ->where('hotels.owner_id', $userId)
                ->select('rooms.room_number', 'hotels.hotel_name')
                ->first();
            $name = $room ? trim(($room->hotel_name ?? '') . ' - Room ' . ($room->room_number ?? '')) : null;
            return [$promotion->room_id, $name];
        }
        return [null, null];
    }
}
