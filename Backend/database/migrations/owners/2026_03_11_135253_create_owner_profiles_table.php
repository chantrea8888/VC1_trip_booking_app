<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owner_profiles', function (Blueprint $table) {
            // Primary key
            $table->bigIncrements('owner_id');

            // Foreign key column (must match users.id type)
            $table->unsignedBigInteger('user_id')->unique();

            // Owner profile fields
            $table->string('name')->nullable();
            $table->string('avatar')->nullable();
            $table->string('bio')->nullable();
            $table->string('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_address')->nullable();
            $table->string('business_registration_number')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('business_phone_number')->nullable();
            $table->string('commision_rate')->default('10%');
            $table->enum('payment_terms', ['monthly', 'per_booking'])->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_document')->nullable();

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Laravel timestamps + soft deletes
            $table->timestamps();
            $table->softDeletes(); // creates deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_profiles');
    }
};