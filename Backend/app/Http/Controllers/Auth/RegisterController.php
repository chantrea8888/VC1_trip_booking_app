<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

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
        $allowedRoles = app()->environment('local')
            ? ['customer', 'owner', 'admin']
            : ['customer', 'owner'];

        $validatedData = $request->validate([
            'name' => 'required|string|max:255|min:2|regex:/^[a-zA-Z\s]+$/',
            'email' => 'required|string|email|max:255|unique:users|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            // Public registration should not create admin accounts.
            'role' => ['nullable', Rule::in($allowedRoles)],
        ]);

        // Additional verification checks
        $name = trim($validatedData['name']);
        $email = strtolower(trim($validatedData['email']));
        
        // Verify name contains only letters and spaces
        if (!preg_match('/^[a-zA-Z\s]+$/', $name)) {
            return response()->json([
                'message' => 'Name can only contain letters and spaces',
                'errors' => ['name' => 'Name can only contain letters and spaces']
            ], 422);
        }
        
        // Verify email format and domain
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'message' => 'Invalid email format',
                'errors' => ['email' => 'Please provide a valid email address']
            ], 422);
        }
        
        // Verify password meets all requirements
        $password = $validatedData['password'];
        if (strlen($password) < 8) {
            return response()->json([
                'message' => 'Password must be at least 8 characters',
                'errors' => ['password' => 'Password must be at least 8 characters long']
            ], 422);
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            return response()->json([
                'message' => 'Password must contain at least one uppercase letter',
                'errors' => ['password' => 'Password must contain at least one uppercase letter']
            ], 422);
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            return response()->json([
                'message' => 'Password must contain at least one lowercase letter',
                'errors' => ['password' => 'Password must contain at least one lowercase letter']
            ], 422);
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            return response()->json([
                'message' => 'Password must contain at least one number',
                'errors' => ['password' => 'Password must contain at least one number']
            ], 422);
        }
        
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            return response()->json([
                'message' => 'Password must contain at least one symbol',
                'errors' => ['password' => 'Password must contain at least one special symbol']
            ], 422);
        }

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
