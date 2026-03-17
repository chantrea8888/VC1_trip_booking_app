<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('owner_settings', function (Blueprint $table) {
            $table->id('owner_settings_id');
            $table->string('owner_id')->unique();
            $table->boolean('auto_confirm_bookings')->default(false);
            $table->boolean('deposit_required')->default(false);
            $table->string('deposit_percentage')->nullable();
            $table->string('max_advance_booking_days')->nullable();
            $table->string('min_advance_booking_days')->nullable();
            $table->json('notification_preferences')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owner_settings');
    }
};
