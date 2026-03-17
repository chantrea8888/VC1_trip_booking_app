<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_bookings', function (Blueprint $table) {
            $table->id('transport_booking_id'); // BIGINT UNSIGNED
            $table->unsignedBigInteger('user_id');
            $table->decimal('total_price', 10, 2)->default(0);
            $table->timestamps();

            // FK to users
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_bookings');
    }
};