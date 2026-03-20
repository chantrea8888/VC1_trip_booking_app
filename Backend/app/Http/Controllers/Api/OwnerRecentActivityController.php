<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecentActivity;
use Illuminate\Http\Request;

class OwnerRecentActivityController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $limit = (int) $request->query('limit', 25);
        if ($limit < 1) {
            $limit = 1;
        }
        if ($limit > 100) {
            $limit = 100;
        }

        // For now, activities are stored per-recipient user_id.
        $items = RecentActivity::query()
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })
            ->orderByDesc('activity_id')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items->map(function (RecentActivity $a) {
                return [
                    'activityId' => $a->activity_id,
                    'bookingId' => $a->booking_id,
                    'userId' => $a->user_id,
                    'notificationId' => $a->notification_id,
                    'activityType' => $a->activity_type,
                    'title' => $a->title,
                    'description' => $a->description,
                    'data' => $a->activity_data,
                    'createdAt' => $a->created_at ? $a->created_at->toIso8601String() : null,
                ];
            })->values(),
        ]);
    }
}

