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

        // This project uses `bookings.id` as a string primary key (e.g. "BK-..."),
        // so `notifications.booking_id` must also be a string.
        $driver = DB::connection()->getDriverName();
        if ($driver !== 'mysql') {
            return;
        }

        // Best-effort schema alignment for environments where `notifications` was created manually.
        try {
            DB::statement("ALTER TABLE `notifications` MODIFY `booking_id` VARCHAR(255) NULL");
        } catch (\Throwable $e) {
            // ignore
        }

        try {
            DB::statement(
                "ALTER TABLE `notifications` MODIFY `type` ENUM(
                    'booking_created',
                    'booking_confirmed',
                    'booking_cancelled',
                    'payment_success',
                    'payment_failed',
                    'review',
                    'system',
                    'promotion'
                ) NOT NULL DEFAULT 'system'"
            );
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function down(): void
    {
        // No-op: avoid destructive schema changes in down migration.
    }
};

