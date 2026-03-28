<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('transports')) {
            return;
        }

        if (Schema::hasColumn('transports', 'is_free')) {
            return;
        }

        Schema::table('transports', function (Blueprint $table) {
            $table->boolean('is_free')->default(false)->after('price_per_km');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('transports')) {
            return;
        }

        if (! Schema::hasColumn('transports', 'is_free')) {
            return;
        }

        Schema::table('transports', function (Blueprint $table) {
            $table->dropColumn('is_free');
        });
    }
};

