<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id('user_address_id');
            $table->string('user_id');
            $table->string('label')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();

            $table->softDeletes(); // adds deleted_at
            $table->timestamps();   // adds created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};