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
        Schema::create('hotel_payments', function (Blueprint $table) {
            $table->id('hotel_payment_id');
            $table->foreignId('hotel_booking_id')->constrained('hotel_bookings')->cascadeOnDelete();
            $table->decimal('amount', 8, 2 )->default(0);
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->string('payment_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_payments');
    }
};
