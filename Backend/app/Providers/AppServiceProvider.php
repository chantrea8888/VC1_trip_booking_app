<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom([
            database_path('migrations'),
            database_path('migrations/users'),
            database_path('migrations/owners'),
            database_path('migrations/hotels'),
            database_path('migrations/trips'),
            database_path('migrations/transports'),
            database_path('migrations/messaging'),
            database_path('migrations/system'),
        ]);
    }
}
