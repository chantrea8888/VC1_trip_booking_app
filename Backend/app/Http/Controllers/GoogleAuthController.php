<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;


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

    public function callbackGoogle()
    {
        try {
            try {
                $googleUser = Socialite::driver('google')->user();
            } catch (InvalidStateException $e) {
                // In SPA setups, sessions/cookies can be lost between redirect and callback.
                $googleUser = Socialite::driver('google')->stateless()->user();
            }

            $googleId = (string) $googleUser->getId();
            $googleEmail = Str::lower(trim((string) $googleUser->getEmail()));

            if ($googleEmail === '') {
                return redirect()->away($this->buildFrontendAuthUrl(
                    'Google did not provide an email address for this account.'
                ));
            }

            $user = User::query()
                ->where('google_id', $googleId)
                ->when($googleEmail, fn($query) => $query->orWhere('email', $googleEmail))
                ->first();
            $isEmailVerified = data_get($googleUser, 'user.email_verified', data_get($googleUser, 'user.verified_email'));
            if ($isEmailVerified !== null && !$isEmailVerified) {
                return redirect()->away($this->buildFrontendAuthUrl(
                    'Your Google email is not verified. Please verify your email and try again.'
                ));
            }

            $user = DB::transaction(function () use ($googleId, $googleEmail, $googleUser) {
                $userByGoogleId = User::query()->where('google_id', $googleId)->first();
                $userByEmail = User::query()->where('email', $googleEmail)->first();

                if ($userByGoogleId && $userByEmail && $userByGoogleId->id !== $userByEmail->id) {
                    Log::warning('Google OAuth account conflict.', [
                        'google_id' => $googleId,
                        'google_email' => $googleEmail,
                        'user_google_id' => $userByGoogleId->id,
                        'user_email' => $userByEmail->id,
                    ]);

                    return null;
                }

                $user = $userByGoogleId ?: $userByEmail;
                $displayName = trim((string) ($googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User'));

                if (!$user) {
                    return User::create([
                        'name' => $displayName,
                        'email' => $googleEmail,
                        'password' => Hash::make(Str::random(40)),
                        'role' => 'customer',
                        'google_id' => $googleId,
                        'email_verified_at' => Carbon::now(),
                    ]);
                }

                $user->forceFill([
                    'name' => $user->name ?: $displayName,
                    'google_id' => $googleId,
                    'email_verified_at' => $user->email_verified_at ?: Carbon::now(),
                ]);

                // Only update the email when it won't conflict with another account.
                if (Str::lower(trim((string) $user->email)) !== $googleEmail) {
                    $emailTaken = User::query()
                        ->where('email', $googleEmail)
                        ->whereKeyNot($user->getKey())
                        ->exists();

                    if (!$emailTaken) {
                        $user->email = $googleEmail;
                    }
                }

                if (empty($user->password)) {
                    $user->password = Hash::make(Str::random(40));
                }

                $user->save();

                return $user;
            });

            if (!$user) {
                return redirect()->away($this->buildFrontendAuthUrl(
                    'This Google account is already linked to a different user. Please contact support.'
                ));
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
        return $this->buildFrontendUrl([
            'auth' => 'login',
            'oauth_error' => $message,
        ]);
    }

    private function buildFrontendSuccessUrl(User $user, string $token): string
    {
        $userPayload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => optional($user->created_at)->toISOString(),
        ];

        $userJson = json_encode($userPayload);
        if ($userJson === false) {
            $userJson = '{}';
        }

        return $this->buildFrontendUrl([
            'access_token' => $token,
            'auth_user' => $userJson,
            'next_view' => $this->resolveNextView($user->role),
        ]);
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
        $explicit = trim((string) env('FRONTEND_URL', ''));
        if ($explicit !== '' && str_starts_with($explicit, 'http')) {
            return rtrim($explicit, '/');
        }

        $envOrigins = array_values(array_filter(array_map(
            static fn ($origin) => trim((string) $origin),
            explode(',', (string) env('FRONTEND_URLS', ''))
        )));

        foreach ($envOrigins as $origin) {
            if ($origin !== '' && $origin !== '*' && str_starts_with($origin, 'http')) {
                return rtrim($origin, '/');
            }
        }

        $configuredOrigins = config('cors.allowed_origins');
        $origins = is_array($configuredOrigins) ? $configuredOrigins : [];

        foreach ($origins as $origin) {
            $origin = trim((string) $origin);
            if ($origin !== '' && $origin !== '*' && str_starts_with($origin, 'http')) {
                return rtrim($origin, '/');
            }
        }

        return 'http://localhost:5173';
    }

    private function buildFrontendUrl(array $query): string
    {
        $frontendBaseUrl = $this->getFrontendBaseUrl();

        return $frontendBaseUrl . '/?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    }
}
