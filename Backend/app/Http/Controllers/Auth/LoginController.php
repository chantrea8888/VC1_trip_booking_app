<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    private function resolveNextView(string $role): string
    {
        return match ($role) {
            'admin' => 'admin-dashboard',
            'owner' => 'owner-dashboard',
            default => 'customer-dashboard',
        };
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'in:admin,customer,owner'], // Optional role assertion from client
        ]);

        $email = Str::lower(trim($validated['email']));
        // Avoid intl/transliterator dependency for throttle keys.
        $throttleKey = Str::lower($email . '|' . $request->ip());
        $maxAttempts = 5;

        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => 'Too many login attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $allowedRoles = ['admin', 'customer', 'owner'];
        if (! in_array($user->role, $allowedRoles, true)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json(['message' => 'User role is not allowed to login'], 403);
        }

        if (! empty($validated['role']) && $validated['role'] !== $user->role) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json(['message' => 'Invalid role for this account'], 403);
        }

        RateLimiter::clear($throttleKey);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'next_view' => $this->resolveNextView($user->role),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
