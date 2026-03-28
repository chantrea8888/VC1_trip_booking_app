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
        Schema::create('hotel_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $table->string('booking_id')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('number_of_rooms')->default(1);
            $table->integer('number_of_guests')->default(1);
            $table->string('room_type')->nullable();
            $table->text('special_requests')->nullable();
            $table->decimal('total_price', 10, 2)->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->timestamps();

            // Indexes for better query performance
            $table->index('customer_id');
            $table->index('hotel_id');
            $table->index('booking_id');
            $table->index('status');
            $table->index('check_in_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_selections');
    }
};
