<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Owner\TransportController;
use App\Http\Controllers\Owner\RoomController;
use App\Http\Controllers\Owner\MessageController;
use App\Http\Controllers\Customer\MessageController as CustomerMessageController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Owner\DestinationController;
use App\Http\Controllers\Owner\PromotionController;
use App\Http\Controllers\Api\BookingController; // ADD THIS

// Public destinations for customers
Route::get('/destinations/public/all', [DestinationController::class, 'getAllPublic']);

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

Route::get('/transports', [TransportController::class, 'publicIndex']);
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

    // Owner rooms routes
    Route::get('/owner/rooms', [RoomController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'role:owner'])->get('/owner/transports', [TransportController::class, 'index']);
Route::middleware(['auth:sanctum', 'role:owner'])->post('/owner/transports', [TransportController::class, 'store']);
Route::middleware(['auth:sanctum', 'role:owner'])->put('/owner/transports/{transport}', [TransportController::class, 'update']);
Route::middleware(['auth:sanctum', 'role:owner'])->patch('/owner/transports/{transport}', [TransportController::class, 'update']);
Route::middleware(['auth:sanctum', 'role:owner'])->delete('/owner/transports/{transport}', [TransportController::class, 'destroy']);

Route::apiResource('users', AuthController::class);


// PROTECTED ROUTES (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Customer booking routes
    Route::middleware(['role:customer,admin'])->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/customer/{customerId}', [BookingController::class, 'customerBookings']);

        // Backwards-compatible aliases
        Route::get('/customer/bookings', [BookingController::class, 'myBookings']);
        Route::post('/customer/bookings', [BookingController::class, 'store']);
    });

    // Owner routes - accessible by owners and admins
    Route::middleware(['role:owner,admin'])->group(function () {
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/stats', [BookingController::class, 'stats']);
        Route::get('/bookings/export', [BookingController::class, 'export']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
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
