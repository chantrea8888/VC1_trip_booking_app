<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\OwnerNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $notifications = collect();
        $unreadCount = 0;

        if ($useNotifications) {
            $cols = Schema::getColumnListing('notifications');
            $idCol = in_array('id', $cols, true) ? 'id' : (in_array('notification_id', $cols, true) ? 'notification_id' : 'id');
            $typeCol = in_array('type', $cols, true) ? 'type' : (in_array('notification_type', $cols, true) ? 'notification_type' : null);
            $dataCol = in_array('data', $cols, true) ? 'data' : (in_array('notification_data', $cols, true) ? 'notification_data' : null);
            $hasReadAt = in_array('read_at', $cols, true);
            $hasIsRead = in_array('is_read', $cols, true);

            $q = DB::table('notifications')
                ->where('user_id', $user->id)
                ->orderByDesc($idCol);

            if ($onlyUnread) {
                if ($hasReadAt) {
                    $q->whereNull('read_at');
                } elseif ($hasIsRead) {
                    $q->where('is_read', 0);
                }
            }

            $notifications = collect($q->limit($limit)->get());

            $unreadQ = DB::table('notifications')->where('user_id', $user->id);
            if ($hasReadAt) {
                $unreadQ->whereNull('read_at');
            } elseif ($hasIsRead) {
                $unreadQ->where('is_read', 0);
            } else {
                $unreadQ->whereRaw('1=0');
            }
            $unreadCount = (int) $unreadQ->count();

            // If `notifications` exists but is empty, fall back to legacy table for now.
            if ($notifications->isEmpty()) {
                $useNotifications = false;
            }
        }

        if (! $useNotifications) {
            $fallbackQuery = OwnerNotification::query()
                ->where('user_id', $user->id)
                ->orderByDesc('id');
            if ($onlyUnread) {
                $fallbackQuery->whereNull('read_at');
            }
            $notifications = $fallbackQuery->limit($limit)->get();
            $unreadCount = (int) OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'data' => $notifications->map(function ($n) use ($useNotifications) {
                if ($useNotifications) {
                    $cols = Schema::getColumnListing('notifications');
                    $idCol = in_array('id', $cols, true) ? 'id' : (in_array('notification_id', $cols, true) ? 'notification_id' : 'id');
                    $typeCol = in_array('type', $cols, true) ? 'type' : (in_array('notification_type', $cols, true) ? 'notification_type' : null);
                    $dataCol = in_array('data', $cols, true) ? 'data' : (in_array('notification_data', $cols, true) ? 'notification_data' : null);

                    $rawData = $dataCol ? ($n->{$dataCol} ?? null) : null;
                    $decoded = null;
                    if (is_string($rawData) && $rawData !== '') {
                        $decoded = json_decode($rawData, true);
                    } elseif (is_array($rawData)) {
                        $decoded = $rawData;
                    }

                    return [
                        'id' => $n->{$idCol},
                        'title' => $n->title ?? '',
                        'message' => $n->message ?? '',
                        'bookingId' => $n->booking_id ?? null,
                        'type' => $typeCol ? ($n->{$typeCol} ?? null) : null,
                        'data' => $decoded,
                        'readAt' => $n->read_at ?? null,
                        'createdAt' => $n->created_at ?? null,
                    ];
                }

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

        $unreadCount = 0;

        if ($this->notificationsTableEnabled()) {
            $cols = Schema::getColumnListing('notifications');
            $hasReadAt = in_array('read_at', $cols, true);
            $hasIsRead = in_array('is_read', $cols, true);
            $q = DB::table('notifications')->where('user_id', $user->id);
            if ($hasReadAt) {
                $q->whereNull('read_at');
            } elseif ($hasIsRead) {
                $q->where('is_read', 0);
            } else {
                $q->whereRaw('1=0');
            }
            $unreadCount = (int) $q->count();
        }

        if ($unreadCount === 0) {
            $unreadCount = (int) OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        if ($this->notificationsTableEnabled()) {
            $cols = Schema::getColumnListing('notifications');
            $idCol = in_array('id', $cols, true) ? 'id' : (in_array('notification_id', $cols, true) ? 'notification_id' : 'id');
            $hasReadAt = in_array('read_at', $cols, true);
            $hasIsRead = in_array('is_read', $cols, true);

            $row = DB::table('notifications')->where('user_id', $user->id)->where($idCol, $id)->first();
            if ($row) {
                $update = [];
                if ($hasReadAt) $update['read_at'] = now();
                if ($hasIsRead) $update['is_read'] = 1;
                if (!empty($update)) {
                    DB::table('notifications')->where('user_id', $user->id)->where($idCol, $id)->update($update);
                }

                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $id,
                        'readAt' => $hasReadAt ? now()->toIso8601String() : null,
                    ],
                ]);
            }
        }

        $n = OwnerNotification::query()->where('user_id', $user->id)->where('id', $id)->first();

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
            $cols = Schema::getColumnListing('notifications');
            $hasReadAt = in_array('read_at', $cols, true);
            $hasIsRead = in_array('is_read', $cols, true);
            $update = [];
            if ($hasReadAt) $update['read_at'] = now();
            if ($hasIsRead) $update['is_read'] = 1;
            if (!empty($update)) {
                DB::table('notifications')->where('user_id', $user->id)->update($update);
            }
        }

        OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }
}
