<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\OwnerNotification;
use Illuminate\Http\Request;
<<<<<<< HEAD
use Illuminate\Support\Facades\DB;
=======
>>>>>>> social-account
use Illuminate\Support\Facades\Schema;

class OwnerNotificationController extends Controller
{
    private function notificationsTableEnabled(): bool
    {
<<<<<<< HEAD
        if (! Schema::hasTable('notifications')) {
            return false;
        }

        try {
            $cols = Schema::getColumnListing('notifications');
        } catch (\Throwable $e) {
            return false;
        }

        // This app supports a "custom notifications" table that contains `user_id`, `title`, `message`, etc.
        // Many Laravel installs also have the default `notifications` table which uses `notifiable_id` and
        // does NOT contain `user_id`. Treat those schemas as unsupported and fall back to `owner_notifications`.
        return in_array('user_id', $cols, true);
=======
        return Schema::hasTable('notifications');
>>>>>>> social-account
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
<<<<<<< HEAD
        $notifications = collect();
        $unreadCount = 0;
=======
        $query = ($useNotifications ? AppNotification::query() : OwnerNotification::query())
            ->where('user_id', $user->id)
            ->orderByDesc('id');
>>>>>>> social-account

        if ($useNotifications) {
            $cols = Schema::getColumnListing('notifications');
            if (! in_array('user_id', $cols, true)) {
                $useNotifications = false;
            }
        }

<<<<<<< HEAD
        if ($useNotifications) {
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
=======
        $notifications = $query->limit($limit)->get();

        // If `notifications` exists but is empty (or the app is still writing to `owner_notifications`),
        // fall back so the owner UI still shows activity.
        if ($useNotifications && $notifications->isEmpty()) {
>>>>>>> social-account
            $fallbackQuery = OwnerNotification::query()
                ->where('user_id', $user->id)
                ->orderByDesc('id');
            if ($onlyUnread) {
                $fallbackQuery->whereNull('read_at');
            }
            $notifications = $fallbackQuery->limit($limit)->get();
<<<<<<< HEAD
            $unreadCount = (int) OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
=======
        }

        $unreadCount = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count()
            : OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();

        if ($useNotifications && $unreadCount === 0) {
            $fallbackUnread = OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
            $unreadCount = $fallbackUnread;
>>>>>>> social-account
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
<<<<<<< HEAD
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

                    // Prefer the original booking code from the snapshot payload (e.g. "BK-...") when present.
                    // The `notifications.booking_id` column can be either a string or a numeric token depending on
                    // which migration was used, so using the snapshot keeps the frontend consistent and prevents
                    // duplicated rows when the UI merges "derived from bookings" notifications.
                    $bookingCode = null;
                    if (is_array($decoded)) {
                        $candidate = $decoded['id'] ?? ($decoded['bookingId'] ?? ($decoded['booking_id'] ?? null));
                        if (is_string($candidate)) {
                            $candidate = trim($candidate);
                            if ($candidate !== '') $bookingCode = $candidate;
                        }
                    }

                    return [
                        'id' => $n->{$idCol},
                        'title' => $n->title ?? '',
                        'message' => $n->message ?? '',
                        'bookingId' => $bookingCode ?? ($n->booking_id ?? null),
                        'type' => $typeCol ? ($n->{$typeCol} ?? null) : null,
                        'data' => $decoded,
                        'readAt' => $n->read_at ?? null,
                        'createdAt' => $n->created_at ?? null,
                    ];
                }

=======
            'data' => $notifications->map(function ($n) {
>>>>>>> social-account
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

<<<<<<< HEAD
        $unreadCount = 0;

        if ($this->notificationsTableEnabled()) {
            $cols = Schema::getColumnListing('notifications');
            if (! in_array('user_id', $cols, true)) {
                $cols = [];
            }
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
=======
        $useNotifications = $this->notificationsTableEnabled();
        $unreadCount = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count()
            : OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();

        if ($useNotifications && $unreadCount === 0) {
            $unreadCount = OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count();
>>>>>>> social-account
        }

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();

<<<<<<< HEAD
        if ($this->notificationsTableEnabled()) {
            $cols = Schema::getColumnListing('notifications');
            if (! in_array('user_id', $cols, true)) {
                $cols = [];
            }
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
=======
        $useNotifications = $this->notificationsTableEnabled();

        $n = $useNotifications
            ? AppNotification::query()->where('user_id', $user->id)->where('id', $id)->first()
            : null;

        if (! $n) {
            $n = OwnerNotification::query()->where('user_id', $user->id)->where('id', $id)->first();
        }
>>>>>>> social-account

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
<<<<<<< HEAD
            $cols = Schema::getColumnListing('notifications');
            if (! in_array('user_id', $cols, true)) {
                $cols = [];
            }
            $hasReadAt = in_array('read_at', $cols, true);
            $hasIsRead = in_array('is_read', $cols, true);
            $update = [];
            if ($hasReadAt) $update['read_at'] = now();
            if ($hasIsRead) $update['is_read'] = 1;
            if (!empty($update)) {
                DB::table('notifications')->where('user_id', $user->id)->update($update);
            }
=======
            AppNotification::query()->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);
>>>>>>> social-account
        }

        OwnerNotification::query()->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }
}
