<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        if (!$this->hasGoogleCredentials()) {
            return redirect()->away($this->buildFrontendAuthUrl(
                'Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Backend/.env.'
            ));
        }

        return Socialite::driver('google')->redirect();
    }

    public function CallbackGoogle()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $googleId = (string) $googleUser->getId();
            $googleEmail = Str::lower(trim((string) $googleUser->getEmail()));

            if ($googleEmail === '') {
                return redirect()->away($this->buildFrontendAuthUrl(
                    'Google did not provide an email address for this account.'
                ));
            }

            $user = User::query()
                ->where('google_id', $googleId)
                ->when($googleEmail, fn ($query) => $query->orWhere('email', $googleEmail))
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?: 'Google User',
                    'email' => $googleEmail,
                    'password' => Hash::make(Str::random(40)),
                    'role' => 'customer',
                    'google_id' => $googleId,
                    'email_verified_at' => Carbon::now(),
                ]);
            } else {
                $user->forceFill([
                    'name' => $user->name ?: ($googleUser->getName() ?: 'Google User'),
                    'email' => $googleEmail,
                    'google_id' => $googleId,
                    'email_verified_at' => $user->email_verified_at ?: Carbon::now(),
                ]);

                if (empty($user->password)) {
                    $user->password = Hash::make(Str::random(40));
                }

                $user->save();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect()->away($this->buildFrontendSuccessUrl($user, $token));
            
        } catch (Exception $e) {
            Log::warning('Google authentication failed.', [
                'message' => $e->getMessage(),
            ]);

            return redirect()->away($this->buildFrontendAuthUrl(
                'Failed to authenticate with Google. Check GOOGLE_REDIRECT_URI and your Google Cloud OAuth settings.'
            ));
        }

    }

    private function hasGoogleCredentials(): bool
    {
        $clientId = (string) config('services.google.client_id');
        $clientSecret = (string) config('services.google.client_secret');
        $redirect = (string) config('services.google.redirect');

        $invalidPlaceholders = [
            '',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'your_google_client_id',
            'your_google_client_secret',
        ];

        return !in_array($clientId, $invalidPlaceholders, true)
            && !in_array($clientSecret, $invalidPlaceholders, true)
            && filled($redirect);
    }

    private function buildFrontendAuthUrl(string $message): string
    {
        $frontendBaseUrl = $this->getFrontendBaseUrl();

        return $frontendBaseUrl . '/?auth=login&oauth_error=' . urlencode($message);
    }

    private function buildFrontendSuccessUrl(User $user, string $token): string
    {
        $frontendBaseUrl = $this->getFrontendBaseUrl();
        $userPayload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ];

        return $frontendBaseUrl . '/?access_token=' . urlencode($token)
            . '&auth_user=' . urlencode(json_encode($userPayload))
            . '&next_view=' . urlencode($this->resolveNextView($user->role));
    }

    private function resolveNextView(string $role): string
    {
        return match ($role) {
            'admin' => 'admin-dashboard',
            'owner' => 'owner-dashboard',
            default => 'customer-dashboard',
        };
    }

    private function getFrontendBaseUrl(): string
    {
        $frontendOrigins = array_filter(array_map(
            'trim',
            explode(',', (string) env('FRONTEND_URLS', 'http://localhost:5173,http://127.0.0.1:5173'))
        ));

        return rtrim($frontendOrigins[0] ?? 'http://localhost:5173', '/');
    }
}
