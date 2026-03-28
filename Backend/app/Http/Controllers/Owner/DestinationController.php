<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DestinationController extends Controller
{
    private function normalizeImagePath(string $value): ?string
    {
        $normalized = str_replace('\\', '/', trim($value));

        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $normalized)) {
            $path = parse_url($normalized, PHP_URL_PATH) ?? '';
            $normalized = $path ?: '';
        }

        if ($normalized === '') {
            return null;
        }

        if (str_contains($normalized, '/storage/')) {
            $normalized = substr($normalized, strpos($normalized, '/storage/') + strlen('/storage/'));
        }

        $normalized = ltrim($normalized, '/');

        if (str_starts_with($normalized, 'storage/')) {
            $normalized = substr($normalized, strlen('storage/'));
        }

        if (str_starts_with($normalized, 'images/') || str_starts_with($normalized, 'destinations/')) {
            return $normalized;
        }

        return null;
    }
    
    private function buildPublicImageUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($value));

        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?:/[^/]#i', $normalized)) {
            $normalized = preg_replace('#^([a-z]+:)/#i', '$1//', $normalized);
        }

        if (preg_match('#^https?://#i', $normalized)) {
            $path = parse_url($normalized, PHP_URL_PATH) ?? '';
            if ($path && str_contains($path, '/storage/')) {
                $normalized = substr($path, strpos($path, '/storage/') + strlen('/storage/'));
            } else {
                return $normalized;
            }
        }

        
        $relative = ltrim($normalized, '/');

        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        if (Str::contains($relative, ['..', './', '.\\'])) {
            return null;
        }

        $storagePath = public_path('storage');
        if (is_dir($storagePath) || is_link($storagePath)) {
            return url('/storage/' . $relative);
        }

        return url('/api/files/' . $relative);
    }

    private function formatDestination(Destination $destination): array
    {
        $data = $destination->toArray();
        $data['image'] = $this->buildPublicImageUrl($destination->image);
        $images = is_array($destination->images) ? $destination->images : [];
        $data['images'] = array_values(array_filter(array_map(
            fn ($image) => $this->buildPublicImageUrl(is_string($image) ? $image : ''),
            $images
        )));

        return $data;
    }
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
                'data' => $destinations->map(fn (Destination $destination) => $this->formatDestination($destination)),
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
            $rules = [
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'required|string|max:255',
                'address' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'nullable',
                'images' => 'nullable|array',
                'images.*' => 'nullable',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ];

            $validated = $request->validate($rules);

            if ($request->hasFile('image')) {
                Validator::make(
                    ['image' => $request->file('image')],
                    ['image' => 'image|mimes:jpeg,jpg,png,webp|max:5120']
                )->validate();
            }

            $imagesFiles = $request->file('images');
            if ($imagesFiles) {
                $imagesFiles = is_array($imagesFiles) ? $imagesFiles : [$imagesFiles];
                Validator::make(
                    ['images' => $imagesFiles],
                    ['images' => 'array', 'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120']
                )->validate();
            }

            $imageInput = $request->input('image');
            if (is_string($imageInput) && trim($imageInput) !== '') {
                Validator::make(
                    ['image' => $imageInput],
                    ['image' => 'string']
                )->validate();
            }

            $inputImages = $request->input('images');
            if (is_array($inputImages)) {
                Validator::make(
                    ['images' => $inputImages],
                    ['images' => 'array', 'images.*' => 'nullable|string']
                )->validate();
            }

            $validated['user_id'] = auth()->id();
            $validated['rating'] = $validated['rating'] ?? 0;
            $validated['total_bookings'] = 0;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('images/destinations', 'public');
                $validated['image'] = $path;
            }

            $uploadedImages = [];
            $imagesFiles = $request->file('images');
            if ($imagesFiles) {
                $imagesFiles = is_array($imagesFiles) ? $imagesFiles : [$imagesFiles];
                foreach ($imagesFiles as $file) {
                    if (!$file) {
                        continue;
                    }
                    $path = $file->store('images/destinations', 'public');
                    $uploadedImages[] = $path;
                }
            }

            $inputImages = $request->input('images');
            if (is_array($inputImages)) {
                foreach ($inputImages as $image) {
                    if (is_string($image) && trim($image) !== '') {
                        $normalized = $this->normalizeImagePath($image);
                        if ($normalized) {
                            $uploadedImages[] = $normalized;
                        }
                    }
                }
            }

            if (!empty($uploadedImages)) {
                $validated['images'] = $uploadedImages;
            }

            $destination = Destination::create($validated);

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destination),
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
    public function show($destination): JsonResponse
    {
        try {
            \Log::info('Show destination - Parameter received:', ['destination' => $destination]);

            if (is_null($destination) || $destination === '' || $destination === 'undefined') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($destination)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$destination);

            if (!$destinationModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->user_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destinationModel),
                'message' => 'Destination retrieved successfully'
            ]);
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
    public function update(Request $request, $destination): JsonResponse
    {
        try {
            \Log::info('Update destination - Parameter received:', ['destination' => $destination]);

            $id = $destination;

            if (is_null($id) || $id === '' || $id === 'undefined') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$id);

            if (!$destinationModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->user_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $rules = [
                'name' => 'string|max:255',
                'type' => 'string|max:255',
                'description' => 'nullable|string',
                'location' => 'string|max:255',
                'address' => 'nullable|string',
                'price' => 'numeric|min:0',
                'image' => 'nullable',
                'images' => 'nullable|array',
                'images.*' => 'nullable',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ];

            $validated = $request->validate($rules);

            if ($request->hasFile('image')) {
                Validator::make(
                    ['image' => $request->file('image')],
                    ['image' => 'image|mimes:jpeg,jpg,png,webp|max:5120']
                )->validate();
            }

            $imagesFiles = $request->file('images');
            if ($imagesFiles) {
                $imagesFiles = is_array($imagesFiles) ? $imagesFiles : [$imagesFiles];
                Validator::make(
                    ['images' => $imagesFiles],
                    ['images' => 'array', 'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120']
                )->validate();
            }

            $imageInput = $request->input('image');
            if (is_string($imageInput) && trim($imageInput) !== '') {
                Validator::make(
                    ['image' => $imageInput],
                    ['image' => 'string']
                )->validate();
            }

            $inputImages = $request->input('images');
            if (is_array($inputImages)) {
                Validator::make(
                    ['images' => $inputImages],
                    ['images' => 'array', 'images.*' => 'nullable|string']
                )->validate();
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('images/destinations', 'public');
                $validated['image'] = $path;
            } else {
                $imageInput = $request->input('image');
                if (is_string($imageInput) && trim($imageInput) !== '') {
                    $normalized = $this->normalizeImagePath($imageInput);
                    if ($normalized) {
                        $validated['image'] = $normalized;
                    } else {
                        unset($validated['image']);
                    }
                } else {
                    unset($validated['image']);
                }
            }

            $uploadedImages = [];
            $imagesFiles = $request->file('images');
            if ($imagesFiles) {
                $imagesFiles = is_array($imagesFiles) ? $imagesFiles : [$imagesFiles];
                foreach ($imagesFiles as $file) {
                    if (!$file) {
                        continue;
                    }
                    $path = $file->store('images/destinations', 'public');
                    $uploadedImages[] = $path;
                }
            }

            $inputImages = $request->input('images');
            if (is_array($inputImages)) {
                foreach ($inputImages as $image) {
                    if (is_string($image) && trim($image) !== '') {
                        $normalized = $this->normalizeImagePath($image);
                        if ($normalized) {
                            $uploadedImages[] = $normalized;
                        }
                    }
                }
            }

            if (!empty($uploadedImages)) {
                $validated['images'] = $uploadedImages;
            } else {
                unset($validated['images']);
            }

            $destinationModel->update($validated);

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destinationModel->fresh()),
                'message' => 'Destination updated successfully'
            ]);
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
    public function destroy($destination): JsonResponse
    {
        try {
            \Log::info('Delete destination - Raw parameter received:', ['destination' => $destination, 'type' => gettype($destination)]);

            // Handle the ID parameter more carefully
            $id = $destination;
            
            \Log::info('Delete destination - Processing ID:', ['id' => $id]);

            if (is_null($id) || $id === '' || $id === 'undefined') {
                \Log::error('Delete destination - Invalid ID received:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($id)) {
                \Log::error('Delete destination - ID not numeric:', ['id' => $id, 'type' => gettype($id)]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$id);

            if (!$destinationModel) {
                \Log::warning('Delete destination - Destination not found:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->user_id != auth()->id()) {
                \Log::warning('Delete destination - Unauthorized:', ['id' => $id, 'owner_id' => $destinationModel->user_id, 'auth_id' => auth()->id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $destinationModel->delete();

            \Log::info('Delete destination - Success:', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Destination deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Delete destination - Exception:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
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
                'data' => $destinations->map(fn (Destination $destination) => $this->formatDestination($destination)),
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
