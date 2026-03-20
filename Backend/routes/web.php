<?php

use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    /** @var Request $request */
    $request = request();

    if ($request->expectsJson() || $request->query('format') === 'json') {
        return response()->json([
            'message' => 'Laravel Backend API running',
        ]);
    }

    return view('welcome');
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    
    if (!$user) {
        return redirect('/login');
    }
    
    $nextView = match ($user->role) {
        'admin' => 'admin-dashboard',
        'owner' => 'owner-dashboard', 
        'customer' => 'customer-dashboard',
        default => 'customer-dashboard',
    };
    
    return Inertia::render($nextView);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'CallbackGoogle'])->name('google.callback');
// require __DIR__.'/auth.php';
