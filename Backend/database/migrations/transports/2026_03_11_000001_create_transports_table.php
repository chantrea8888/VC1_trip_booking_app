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
        Schema::create('transports', function (Blueprint $table) {
            $table->id('transport_id');
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('service_name');
            $table->enum('transport_type', ['Car Rental', 'Shuttle', 'Bus', 'Other'])->default('Car Rental');
            $table->decimal('price_per_km', 10, 2);
            $table->text('route_description')->nullable();
            $table->text('service_details')->nullable();
            $table->string('vehicle_photo_url', 500)->nullable();
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transports');
    }
};
