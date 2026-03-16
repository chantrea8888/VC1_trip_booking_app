<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE destinations MODIFY image LONGTEXT NULL');
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE destinations ALTER COLUMN image TYPE TEXT');
            return;
        }

        // SQLite does not enforce varchar lengths; keep as-is.
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE destinations MODIFY image VARCHAR(255) NULL');
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE destinations ALTER COLUMN image TYPE VARCHAR(255)');
            return;
        }

        // SQLite does not enforce varchar lengths; keep as-is.
    }
};
