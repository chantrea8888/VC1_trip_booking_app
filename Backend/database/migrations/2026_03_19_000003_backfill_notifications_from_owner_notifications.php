<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }
        if (! Schema::hasTable('owner_notifications')) {
            return;
        }

        // Backfill only when `notifications` is empty to avoid duplicates.
        $notificationsCount = (int) DB::table('notifications')->count();
        if ($notificationsCount > 0) {
            return;
        }

        $ownerNotifications = DB::table('owner_notifications')->orderBy('id')->get();
        if ($ownerNotifications->isEmpty()) {
            return;
        }

        // Insert with compatible schema. `bookings.id` is string, so store `booking_id` as string.
        $now = now();
        $rows = [];

        foreach ($ownerNotifications as $n) {
            $type = $n->booking_id ? 'booking_created' : 'system';

            $rows[] = [
                'user_id' => $n->user_id,
                'booking_id' => $n->booking_id ? (string) $n->booking_id : null,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $type,
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at ?? $now,
                'updated_at' => $n->updated_at ?? $now,
            ];
        }

        // Chunk insert to avoid large single queries.
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('notifications')->insert($chunk);
        }
    }

    public function down(): void
    {
        // No-op: avoid deleting production notifications.
    }
};

