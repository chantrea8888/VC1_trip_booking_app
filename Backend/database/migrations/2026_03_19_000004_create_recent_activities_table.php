<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('recent_activities')) {
            return;
        }

        Schema::create('recent_activities', function (Blueprint $table) {
            $table->id('activity_id');

            // `bookings.id` is a string in this project (e.g. "BK-...").
            $table->string('booking_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();

            // Link back to a notification row when available.
            $table->unsignedBigInteger('notification_id')->nullable()->index();

            $table->string('activity_type', 50)->default('new_booking')->index();
            $table->string('title')->nullable();
            $table->text('description');

            $table->json('activity_data')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        // No-op to avoid destructive drops in shared environments.
    }
};

