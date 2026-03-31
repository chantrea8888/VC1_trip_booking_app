<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    private function withBearerToken(User $user)
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return $this->withHeader('Authorization', 'Bearer ' . $token)
            ->withHeader('Accept', 'application/json');
    }

    public function test_health_endpoint_works(): void
    {
        $this->getJson('/api/health')->assertOk()->assertJsonStructure(['ok', 'db']);
    }

    public function test_auth_user_and_logout_work_with_bearer_token(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->withBearerToken($user)
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->withBearerToken($user)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonStructure(['message']);
    }

    public function test_customer_access_and_customer_flows(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        // Access guard
        $this->withBearerToken($customer)
            ->getJson('/api/customer/access')
            ->assertOk();

        // Bookings (customer)
        $bookingId = 'BK-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(6));
        $payload = [
            'id' => $bookingId,
            'guest' => $customer->name,
            'service' => 'Hotel',
            'route' => 'Phnom Penh',
            'pax' => 1,
            'amount' => 10,
            'status' => 'pending',
            'category' => 'hotel',
            'customerEmail' => $customer->email,
            'customerPhone' => '012345678',
        ];

        $this->withBearerToken($customer)
            ->postJson('/api/bookings', $payload)
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->withBearerToken($customer)
            ->getJson('/api/customer/bookings')
            ->assertOk();

        $this->withBearerToken($customer)
            ->getJson('/api/bookings/customer/' . $customer->id)
            ->assertOk();

        // Trip groups
        $create = $this->withBearerToken($customer)
            ->postJson('/api/trip-groups', ['name' => 'My Trip'])
            ->assertStatus(201)
            ->json();

        $groupId = (int) ($create['data']['group']['id'] ?? 0);
        $accessCode = (string) ($create['data']['group']['access_code'] ?? '');

        $this->assertGreaterThan(0, $groupId);
        $this->assertNotSame('', $accessCode);

        $this->withBearerToken($customer)
            ->getJson('/api/trip-groups')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withBearerToken($customer)
            ->getJson('/api/trip-groups/' . $groupId)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withBearerToken($customer)
            ->postJson('/api/trip-groups/' . $groupId . '/messages', ['text' => 'Hello'])
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->withBearerToken($customer)
            ->getJson('/api/trip-groups/' . $groupId . '/messages')
            ->assertOk()
            ->assertJsonPath('success', true);

        // Join flow (second customer)
        $customer2 = User::factory()->create(['role' => 'customer']);
        $this->withBearerToken($customer2)
            ->postJson('/api/trip-groups/join', ['access_code' => $accessCode])
            ->assertOk()
            ->assertJsonPath('success', true);

        // Customer messaging
        $this->withBearerToken($customer)
            ->postJson('/api/customer/messages/send', [
                'receiver_id' => $owner->id,
                'content' => 'Hi owner',
            ])
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->withBearerToken($customer)
            ->getJson('/api/customer/messages/' . $owner->id)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_owner_access_profile_and_bookings_index_work(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);

        $this->withBearerToken($owner)
            ->getJson('/api/owner/access')
            ->assertOk();

        $this->withBearerToken($owner)
            ->getJson('/api/owner/profile')
            ->assertOk()
            ->assertJsonStructure(['user', 'profile']);

        // Owner bookings index should return JSON even if empty.
        $this->withBearerToken($owner)
            ->getJson('/api/bookings')
            ->assertOk();
    }
}
