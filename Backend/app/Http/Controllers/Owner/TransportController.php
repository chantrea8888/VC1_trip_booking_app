<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Transport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TransportController extends Controller
{
    public function publicIndex()
    {
        $transports = Transport::query()
            ->orderByDesc('transport_id')
            ->get();

        return response()->json([
            'message' => 'Transports fetched successfully',
            'data' => $transports,
        ]);
    }

    public function index(Request $request)
    {
        $transports = Transport::query()
            ->where('owner_id', $request->user()->id)
            ->orderByDesc('transport_id')
            ->get();

        return response()->json([
            'message' => 'Transports fetched successfully',
            'data' => $transports,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:255'],
            'transport_type' => ['nullable', 'in:Car Rental,Train,Bus,Other'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'route_description' => ['nullable', 'string'],
            'service_details' => ['nullable', 'string'],
            'vehicle_photo_url' => ['nullable', 'string', 'max:500'],
            'vehicle_photo' => ['nullable', 'image', 'max:10240'],
            'status' => ['nullable', 'in:active,inactive,pending'],
        ]);

        $photoPath = $validated['vehicle_photo_url'] ?? null;
        if ($request->hasFile('vehicle_photo')) {
            $file = $request->file('vehicle_photo');
            $storedPath = $file->storePublicly('uploads/transports', 'public');
            $photoPath = Storage::url($storedPath);
        }

        $transport = Transport::create([
            'owner_id' => $request->user()->id,
            'service_name' => $validated['service_name'],
            'transport_type' => $validated['transport_type'] ?? 'Car Rental',
            'price_per_km' => $validated['price_per_km'],
            'route_description' => $validated['route_description'] ?? null,
            'service_details' => $validated['service_details'] ?? null,
            'vehicle_photo_url' => $photoPath,
            'status' => $validated['status'] ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Transport created successfully',
            'data' => $transport,
        ], 201);
    }

    public function destroy(Request $request, Transport $transport)
    {
        if ($transport->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to delete this transport.',
            ], 403);
        }

        $photoPath = $transport->vehicle_photo_url;
        if ($photoPath && !str_starts_with($photoPath, 'http')) {
            $relativePath = ltrim($photoPath, '/');
            $fullPath = public_path($relativePath);
            if (is_file($fullPath)) {
                @unlink($fullPath);
            }
        }

        $transport->delete();

        return response()->json([
            'message' => 'Transport deleted successfully',
        ]);
    }

    public function update(Request $request, Transport $transport)
    {
        if ($transport->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to update this transport.',
            ], 403);
        }

        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:255'],
            'transport_type' => ['nullable', 'in:Car Rental,Train,Bus,Other'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'route_description' => ['nullable', 'string'],
            'service_details' => ['nullable', 'string'],
            'vehicle_photo_url' => ['nullable', 'string', 'max:500'],
            'vehicle_photo' => ['nullable', 'image', 'max:10240'],
            'status' => ['nullable', 'in:active,inactive,pending'],
        ]);

        $photoPath = $validated['vehicle_photo_url'] ?? $transport->vehicle_photo_url;
        if ($request->hasFile('vehicle_photo')) {
            $file = $request->file('vehicle_photo');
            $storedPath = $file->storePublicly('uploads/transports', 'public');
            $photoPath = Storage::url($storedPath);

            $oldPhoto = $transport->vehicle_photo_url;
            if ($oldPhoto && !str_starts_with($oldPhoto, 'http')) {
                $relativePath = ltrim($oldPhoto, '/');
                $fullPath = public_path($relativePath);
                if (is_file($fullPath)) {
                    @unlink($fullPath);
                }
            }
        }

        $transport->update([
            'service_name' => $validated['service_name'],
            'transport_type' => $validated['transport_type'] ?? $transport->transport_type ?? 'Car Rental',
            'price_per_km' => $validated['price_per_km'],
            'route_description' => $validated['route_description'] ?? null,
            'service_details' => $validated['service_details'] ?? null,
            'vehicle_photo_url' => $photoPath,
            'status' => $validated['status'] ?? $transport->status ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Transport updated successfully',
            'data' => $transport,
        ]);
    }
}
