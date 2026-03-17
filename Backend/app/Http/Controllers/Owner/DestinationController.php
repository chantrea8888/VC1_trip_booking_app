<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DestinationController extends Controller
{
    /**
     * Get all destinations for the authenticated owner
     */
    public function index(): JsonResponse
    {
        try {
            $destinations = Destination::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations,
                'message' => 'Destinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destinations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created destination
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'required|string|max:255',
                'address' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ]);

            $validated['user_id'] = auth()->id();
            $validated['rating'] = $validated['rating'] ?? 0;
            $validated['total_bookings'] = 0;

            $destination = Destination::create($validated);

            return response()->json([
                'success' => true,
                'data' => $destination,
                'message' => 'Destination created successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific destination
     */
    public function show($id): JsonResponse
    {
        try {
            $destination = Destination::where('user_id', auth()->id())
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $destination,
                'message' => 'Destination retrieved successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a destination
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $destination = Destination::where('user_id', auth()->id())
                ->findOrFail($id);

            $validated = $request->validate([
                'name' => 'string|max:255',
                'type' => 'string|max:255',
                'description' => 'nullable|string',
                'location' => 'string|max:255',
                'address' => 'nullable|string',
                'price' => 'numeric|min:0',
                'image' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ]);

            $destination->update($validated);

            return response()->json([
                'success' => true,
                'data' => $destination,
                'message' => 'Destination updated successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a destination
     */
    public function destroy($id): JsonResponse
    {
        try {
            $destination = Destination::where('user_id', auth()->id())
                ->findOrFail($id);

            $destination->delete();

            return response()->json([
                'success' => true,
                'message' => 'Destination deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all public destinations (for customers)
     */
    public function getAllPublic(): JsonResponse
    {
        try {
            $destinations = Destination::where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations,
                'message' => 'Public destinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destinations: ' . $e->getMessage()
            ], 500);
        }
    }
}

