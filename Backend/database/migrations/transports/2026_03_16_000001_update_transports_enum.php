<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE transports MODIFY transport_type ENUM('Car Rental', 'Shuttle', 'Train', 'Bus', 'Other') DEFAULT 'Car Rental'");
        DB::statement("UPDATE transports SET transport_type = 'Train' WHERE transport_type = 'Shuttle'");
        DB::statement("ALTER TABLE transports MODIFY transport_type ENUM('Car Rental', 'Train', 'Bus', 'Other') DEFAULT 'Car Rental'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE transports SET transport_type = 'Shuttle' WHERE transport_type = 'Train'");
        DB::statement("ALTER TABLE transports MODIFY transport_type ENUM('Car Rental', 'Shuttle', 'Bus', 'Other') DEFAULT 'Car Rental'");
    }
};
