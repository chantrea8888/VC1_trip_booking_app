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
        Schema::create('room_sizes', function (Blueprint $table) {
            $table->id('room_size_id');
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->string('size_name');
            $table->string('max_capacity');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_sizes');
    }
};
