<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $requestedCategory = $request->query('category');
        $allowedCategories = ['hotel', 'transport'];

        $promotions = Promotion::with('promotionLinks')
            ->where('is_active', true)
            ->get()
            ->filter(fn (Promotion $promo) => $promo->isCurrentlyActive());

        if (in_array($requestedCategory, $allowedCategories, true)) {
            $promotions = $promotions->filter(fn (Promotion $promo) =>
                ($promo->service_category ?? 'hotel') === $requestedCategory
            );
        }

        $payload = $promotions->map(function (Promotion $promo) {
            $linkedDestinations = $promo->promotionLinks
                ->where('link_type', 'destination')
                ->pluck('link_id')
                ->values()
                ->toArray();

            $linkedTransports = $promo->promotionLinks
                ->where('link_type', 'transport')
                ->pluck('link_id')
                ->values()
                ->toArray();

            $serviceCategory = $promo->service_category;
            if (!in_array($serviceCategory, ['hotel', 'transport'], true)) {
                if (!empty($linkedTransports) && empty($linkedDestinations)) {
                    $serviceCategory = 'transport';
                } elseif (!empty($linkedDestinations) && empty($linkedTransports)) {
                    $serviceCategory = 'hotel';
                } else {
                    $serviceCategory = 'hotel';
                }
            }

            return [
                'id' => $promo->id,
                'title' => $promo->title,
                'description' => $promo->description,
                'discount' => $promo->discount,
                'type' => $promo->type,
                'service_category' => $serviceCategory,
                'start_date' => $promo->start_date,
                'end_date' => $promo->end_date,
                'expiry' => $promo->expiry,
                'is_active' => (bool) $promo->is_active,
                'linked_destinations' => $linkedDestinations,
                'linked_transports' => $linkedTransports,
                'owner_id' => $promo->owner_id,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $payload,
        ]);
    }
}
