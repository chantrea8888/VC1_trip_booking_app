 <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            if (! Schema::hasColumn('promotions', 'destination_id')) {
                $table->unsignedBigInteger('destination_id')->nullable()->after('service_category');
            }
            if (! Schema::hasColumn('promotions', 'room_id')) {
                $table->unsignedBigInteger('room_id')->nullable()->after('destination_id');
            }
            if (! Schema::hasColumn('promotions', 'transport_id')) {
                $table->unsignedBigInteger('transport_id')->nullable()->after('room_id');
            }
        });

        Schema::table('promotions', function (Blueprint $table) {
            if (Schema::hasColumn('promotions', 'destination_id')) {
                $table->foreign('destination_id')->references('destination_id')->on('destinations')->nullOnDelete();
            }
            if (Schema::hasColumn('promotions', 'room_id')) {
                $table->foreign('room_id')->references('id')->on('rooms')->nullOnDelete();
            }
            if (Schema::hasColumn('promotions', 'transport_id')) {
                $table->foreign('transport_id')->references('transport_id')->on('transports')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            if (Schema::hasColumn('promotions', 'destination_id')) {
                $table->dropForeign(['destination_id']);
                $table->dropColumn('destination_id');
            }
            if (Schema::hasColumn('promotions', 'room_id')) {
                $table->dropForeign(['room_id']);
                $table->dropColumn('room_id');
            }
            if (Schema::hasColumn('promotions', 'transport_id')) {
                $table->dropForeign(['transport_id']);
                $table->dropColumn('transport_id');
            }
        });
    }
};
