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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // Explicit foreign key to bookings table
            $table->unsignedBigInteger('booking_id');
            $table->foreign('booking_id')
                  ->references('id')           // <-- change to booking_id if your table uses booking_id as PK
                  ->on('hotel_bookings')       // <-- change to your actual booking table name
                  ->onDelete('cascade');

            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('credit_card');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->nullable()->unique();
            $table->dateTime('payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
