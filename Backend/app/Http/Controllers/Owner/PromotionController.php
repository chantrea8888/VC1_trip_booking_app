<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
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
            'service_category' => 'nullable|string|in:hotel,transport',
        ]);

        if (!Schema::hasColumn('promotions', 'service_category')) {
            unset($validated['service_category']);
        }

        $validated['owner_id'] = auth()->id();
        if (Schema::hasColumn('promotions', 'service_category') && !isset($validated['service_category'])) {
            $validated['service_category'] = 'hotel';
        }

        $promotion = Promotion::create($validated);

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
            'service_category' => 'nullable|string|in:hotel,transport',
        ]);

        if (!Schema::hasColumn('promotions', 'service_category')) {
            unset($validated['service_category']);
        }

        $promotion->update($validated);

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
}