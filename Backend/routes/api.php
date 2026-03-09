<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [LogoutController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            $user = $request->user();
            $nextView = match ($user?->role) {
                'admin' => 'admin-dashboard',
                'owner' => 'owner-dashboard',
                default => 'customer-dashboard',
            };

            return response()->json([
                'user' => $user,
                'next_view' => $nextView,
            ]);
        });
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/access', function () {
    return response()->json(['message' => 'Admin access granted']);
});

Route::middleware(['auth:sanctum', 'role:customer'])->get('/customer/access', function () {
    return response()->json(['message' => 'Customer access granted']);
});

Route::middleware(['auth:sanctum', 'role:owner'])->get('/owner/access', function () {
    return response()->json(['message' => 'Owner access granted']);
});

Route::apiResource('users', AuthController::class);
