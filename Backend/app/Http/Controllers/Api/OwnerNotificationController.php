<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\OwnerNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class OwnerNotificationController extends Controller
{
    private function notificationsTableEnabled(): bool
    {
        return Schema::hasTable('notifications');
    }

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

        $onlyUnread = filter_var($request->query('unread', false), FILTER_VALIDATE_BOOLEAN);

        $useNotifications = $this->notificationsTableEnabled();
        $query = ($useNotifications ? AppNotification::query() : OwnerNotification::query())
            ->where('user_id', $user->id)
            ->orderByDesc('id');

        if ($onlyUnread) {
            $query->whereNull('read_at');
        }

        $notifications = $query->limit($limit)->get();

        // If `notifications` exists but is empty (or the app is still writing to `owner_notifications`),
        // fall back so the owner UI still shows activity.
        if ($useNotifications && $notifications->isEmpty()) {
            $fallbackQuery = OwnerNotification::query()
                ->where('user_id', $user->id)
                ->orderByDesc('id');
            if ($onlyUnread) {
                $fallbackQuery->whereNull('read_at');
            }
            $notifications = $fallbackQuery->limit($limit)->get();
        }

        $unreadCount = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count()
            : OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();

        if ($useNotifications && $unreadCount === 0) {
            $fallbackUnread = OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
            $unreadCount = $fallbackUnread;
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'data' => $notifications->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'message' => $n->message,
                    'bookingId' => $n->booking_id,
                    'type' => $n->type ?? null,
                    'data' => $n->data,
                    'readAt' => $n->read_at ? $n->read_at->toIso8601String() : null,
                    'createdAt' => $n->created_at ? $n->created_at->toIso8601String() : null,
                ];
            })->values(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $useNotifications = $this->notificationsTableEnabled();
        $unreadCount = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count()
            : OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();

        if ($useNotifications && $unreadCount === 0) {
            $unreadCount = OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        $useNotifications = $this->notificationsTableEnabled();

        $n = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->where('id', $id)->first()
            : null;

        if (! $n) {
            $n = OwnerNotification::query()->where('user_id', $user->id)->where('id', $id)->first();
        }

        if (! $n) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        if (! $n->read_at) {
            $n->read_at = now();
            $n->save();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $n->id,
                'readAt' => $n->read_at ? $n->read_at->toIso8601String() : null,
            ],
        ]);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if ($this->notificationsTableEnabled()) {
            AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);
        }

        OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }
}
