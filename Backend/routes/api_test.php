<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API is working!',
        'database' => 'Connected',
        'timestamp' => now()->toDateTimeString(),
        'environment' => app()->environment(),
        'users_count' => \App\Models\User::count()
    ]);
});
