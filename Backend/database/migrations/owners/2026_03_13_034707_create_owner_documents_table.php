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
        Schema::create('owner_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->string('owner_id')->unique();
            $table->string('document_url')->nullable();
            $table->enum('document_type', ['license', 'insurance', 'registration'])->nullable();
            $table->string('expiry_date')->nullable();
            $table->string('verification_status')->default('pending')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owner_documents');
    }
};
