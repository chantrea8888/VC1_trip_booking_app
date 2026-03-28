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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('destination_id');
            $table->foreign('destination_id')
                ->references('destination_id')
                ->on('destinations')
                ->onDelete('cascade');

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('Tour');
            $table->decimal('price', 10, 2);
            $table->integer('duration_hours');
            $table->string('image')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->integer('available_spots')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
