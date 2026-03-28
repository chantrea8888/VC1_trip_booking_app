<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\OwnerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class OwnerProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = OwnerProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $user->name,
            ],
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
            ],
            'profile' => $profile,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'avatar' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'date_of_birth' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:255'],
            'business_registration_number' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:255'],
            'business_phone_number' => ['nullable', 'string', 'max:50'],
            'commision_rate' => ['nullable', 'string', 'max:20'],
            'payment_terms' => ['nullable', Rule::in(['monthly', 'per_booking'])],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:255'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
            'verification_document' => ['nullable', 'string', 'max:2048'],
        ]);

        $userUpdates = Arr::only($validated, ['name', 'email', 'phone_number']);
        if (!empty($userUpdates)) {
            $user->update($userUpdates);
        }

        $profileUpdates = Arr::except($validated, ['email', 'phone_number']);
        $profile = OwnerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileUpdates,
        );

        return response()->json([
            'message' => 'Owner profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone_number' => $user->phone_number,
            ],
            'profile' => $profile,
        ]);
    }
}
