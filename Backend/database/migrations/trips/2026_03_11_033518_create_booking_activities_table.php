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
        Schema::create('booking_activities', function (Blueprint $table) {
            $table->id();

            // Correct foreign key to bookings table
            $table->unsignedBigInteger('booking_id');
            $table->foreign('booking_id')
                  ->references('id')
                  ->on('hotel_bookings')   // Change if your booking table is different
                  ->onDelete('cascade');

            // Foreign key to activities table
            $table->unsignedBigInteger('activity_id');
            $table->foreign('activity_id')
                  ->references('id')
                  ->on('activities')
                  ->onDelete('cascade');

            $table->dateTime('scheduled_date');
            $table->integer('participants')->default(1);
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_activities');
    }
};