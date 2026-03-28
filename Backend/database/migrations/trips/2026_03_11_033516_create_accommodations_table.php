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
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('destination_id');
            $table->foreign('destination_id')
                ->references('destination_id')
                ->on('destinations')
                ->onDelete('cascade');

            $table->string('name');
            $table->string('type')->default('Hotel');
            $table->text('description')->nullable();
            $table->integer('capacity');
            $table->decimal('price_per_night', 10, 2);
            $table->string('image')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->enum('status', ['available', 'booked'])->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};
