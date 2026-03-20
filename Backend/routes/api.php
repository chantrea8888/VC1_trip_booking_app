<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Owner\MessageController;
use App\Http\Controllers\Customer\MessageController as CustomerMessageController;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Owner\DestinationController;
use App\Http\Controllers\Owner\PromotionController;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController; // ADD THIS
use App\Http\Controllers\Api\OwnerNotificationController;
use App\Http\Controllers\Api\TripGroupController;
use App\Http\Controllers\Api\OwnerRecentActivityController;

// Simple health check (useful for confirming API + DB connectivity from the frontend).
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();

        return response()->json([
            'ok' => true,
            'db' => true,
            'driver' => DB::connection()->getDriverName(),
            'database' => method_exists(DB::connection(), 'getDatabaseName') ? DB::connection()->getDatabaseName() : null,
            'demo_owner_exists' => \App\Models\User::query()->where('email', 'owner@test.com')->exists(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'ok' => false,
            'db' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::prefix('auth')->group(function () {

    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [LogoutController::class, 'logout']);

        Route::get('/user', function (Request $request) {

            $user = $request->user();

            $nextView = match ($user->role) {
                'admin' => 'admin-dashboard',
                'owner' => 'owner-dashboard',
                'customer' => 'customer-dashboard',
                default => 'customer-dashboard',
            };

            return response()->json([
                'user' => $user,
                'next_view' => $nextView,
            ]);
        });
    });
});

/*
|--------------------------------------------------------------------------
| Role Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/access', function () {
        return response()->json(['message' => 'Admin access granted']);
    });
});

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/customer/access', function () {
        return response()->json(['message' => 'Customer access granted']);
    });
});

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
        Route::get('/owner/access', function () {
        return response()->json(['message' => 'Owner access granted']);
    });
    
    // Owner destinations routes
    Route::apiResource('destinations', DestinationController::class);
    
    // Owner promotions routes
    Route::apiResource('promotions', PromotionController::class);
});



// PROTECTED ROUTES (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Customer booking routes
    Route::middleware(['role:customer,admin'])->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/customer/{customerId}', [BookingController::class, 'customerBookings']);

        // Backwards-compatible aliases
        Route::get('/customer/bookings', [BookingController::class, 'myBookings']);
        Route::post('/customer/bookings', [BookingController::class, 'store']);

        // Trip group planning (group chat + access code join)
        Route::post('/trip-groups', [TripGroupController::class, 'create']);
        Route::post('/trip-groups/join', [TripGroupController::class, 'join']);
        Route::get('/trip-groups/{groupId}', [TripGroupController::class, 'show']);
        Route::post('/trip-groups/{groupId}/messages', [TripGroupController::class, 'sendMessage']);
    });

    // Owner routes - accessible by owners and admins
    Route::middleware(['role:owner,admin'])->group(function () {
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/stats', [BookingController::class, 'stats']);
        Route::get('/bookings/export', [BookingController::class, 'export']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

        // Owner notifications (new bookings, etc.)
        Route::get('/owner/notifications', [OwnerNotificationController::class, 'index']);
        Route::get('/owner/notifications/unread-count', [OwnerNotificationController::class, 'unreadCount']);
        Route::post('/owner/notifications/read-all', [OwnerNotificationController::class, 'markAllRead']);
        Route::post('/owner/notifications/{id}/read', [OwnerNotificationController::class, 'markRead']);

        // Owner recent activities (Overview feed)
        Route::get('/owner/recent-activities', [OwnerRecentActivityController::class, 'index']);
    });
    
    // Admin only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/access', function () {
            return response()->json(['message' => 'Admin access granted']);
        });
    });
    
    // Customer routes
    Route::middleware(['role:customer'])->get('/customer/access', function () {
        return response()->json(['message' => 'Customer access granted']);
    });
    
    // Owner routes
    Route::middleware(['role:owner'])->get('/owner/access', function () {
        return response()->json(['message' => 'Owner access granted']);
    });
});

/*
|--------------------------------------------------------------------------
| User CRUD
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->apiResource('users', AuthController::class);

/*
|--------------------------------------------------------------------------
| Messaging System (Owner ↔ Customer)
|--------------------------------------------------------------------------
*/


Route::middleware(['auth:sanctum','role:owner'])->group(function () {

    Route::get('/messages', [MessageController::class,'index']);

    Route::get('/messages/{customerId}', [MessageController::class,'conversation']);

    Route::post('/messages/send', [MessageController::class,'send']);

});
/*
|--------------------------------------------------------------------------
| Messaging System (Customer ↔ Owner)
|--------------------------------------------------------------------------
|
| Routes for customers to view and send messages to owners.
| Uses Sanctum for authentication and 'role:customer' middleware.
|
*/

Route::middleware(['auth:sanctum','role:customer'])->group(function () {

    // List all messages/conversations for the customer
    Route::get('/customer/messages', [CustomerMessageController::class,'index']);

    // View conversation with a specific owner
    Route::get('/customer/messages/{ownerId}', [CustomerMessageController::class,'conversation']);

    // Send a new message to an owner
    Route::post('/customer/messages/send', [CustomerMessageController::class,'send']);
});
