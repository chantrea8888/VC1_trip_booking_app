<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    private function resolveNextView(string $role): string
    {
        return match ($role) {
            'admin' => 'admin-dashboard',
            'owner' => 'owner-dashboard',
            default => 'customer-dashboard',
        };
    }

    public function register(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            // Public registration should not create admin accounts.
            'role' => 'nullable|in:customer,owner',
        ]);

        $normalizedEmail = Str::lower(trim($validatedData['email']));
        $role = $validatedData['role'] ?? 'customer';

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $normalizedEmail,
            'password' => Hash::make($validatedData['password']),
            'role' => $role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
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
        ], 201);
    }
}
