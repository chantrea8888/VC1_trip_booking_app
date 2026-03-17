<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings')) {
            Schema::create('bookings', function (Blueprint $table) {
                $table->string('id')->primary();

                $table->string('guest')->nullable();
                $table->string('service');
                $table->string('route');

                $table->date('dateStart')->nullable();
                $table->date('dateEnd')->nullable();
                $table->date('date')->nullable();
                $table->string('time')->nullable();

                $table->unsignedInteger('pax')->default(1);
                $table->decimal('amount', 10, 2)->default(0);
                $table->string('status')->default('pending');
                $table->string('category')->default('trip');

                $table->string('roomType')->nullable();
                $table->string('vehicleType')->nullable();
                $table->string('customerEmail')->nullable();
                $table->string('customerPhone')->nullable();
                $table->text('specialRequests')->nullable();
                $table->string('paymentMethod')->nullable();

                $table->dateTime('createdAt')->nullable();

                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->unsignedBigInteger('destination_id')->nullable();
                $table->unsignedBigInteger('transport_id')->nullable();
            });

            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'destination_id')) {
                $table->unsignedBigInteger('destination_id')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'transport_id')) {
                $table->unsignedBigInteger('transport_id')->nullable();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'destination_id')) {
                $table->dropColumn('destination_id');
            }
            if (Schema::hasColumn('bookings', 'transport_id')) {
                $table->dropColumn('transport_id');
            }
        });
    }
};

