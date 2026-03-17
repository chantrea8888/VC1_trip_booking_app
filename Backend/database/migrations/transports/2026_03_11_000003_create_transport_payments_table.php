<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_payments', function (Blueprint $table) {
            $table->id('transport_payment_id');

            // FK to transport_bookings
            $table->unsignedBigInteger('transport_booking_id');
            $table->foreign('transport_booking_id')
                  ->references('transport_booking_id') // match PK
                  ->on('transport_bookings')
                  ->onDelete('cascade');

            $table->decimal('amount', 10, 2)->default(0);
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->timestamp('payment_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_payments');
    }
};