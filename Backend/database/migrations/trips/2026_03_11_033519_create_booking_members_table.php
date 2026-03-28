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
        Schema::create('booking_members', function (Blueprint $table) {
            $table->id();

            // Use unsignedBigInteger + explicit foreign key
            $table->unsignedBigInteger('booking_id');
            $table->foreign('booking_id')
                  ->references('id')              // <-- change to booking_id if your bookings table uses booking_id as PK
                  ->on('hotel_bookings')          // <-- change to your actual booking table name
                  ->onDelete('cascade');

            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('relationship', ['primary', 'family', 'friend', 'colleague', 'other'])->default('primary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_members');
    }
};