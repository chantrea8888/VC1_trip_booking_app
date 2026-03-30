<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TripGroupController extends Controller
{
    private function requireMember(int $groupId, int $userId): bool
    {
        return DB::table('trip_group_members')
            ->where('group_id', $groupId)
            ->where('user_id', $userId)
            ->exists();
    }

    private function groupPayload(int $groupId): array
    {
        $group = DB::table('trip_groups')->where('id', $groupId)->first();
        if (! $group) {
            return [];
        }

        $members = DB::table('trip_group_members')
            ->where('group_id', $groupId)
            ->orderByRaw("CASE WHEN role = 'Leader' THEN 0 ELSE 1 END, joined_at ASC")
            ->get();

        $messages = DB::table('trip_group_messages')
            ->where('group_id', $groupId)
            ->orderBy('id', 'asc')
            ->limit(200)
            ->get();

        return [
            'group' => $group,
            'members' => $members,
            'messages' => $messages,
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $groupIds = DB::table('trip_group_members')
            ->where('user_id', (int) $user->id)
            ->orderByDesc('joined_at')
            ->pluck('group_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        if (empty($groupIds)) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $groups = DB::table('trip_groups')
            ->whereIn('id', $groupIds)
            ->orderByRaw('FIELD(id, ' . implode(',', $groupIds) . ')')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid payload', 'errors' => $validator->errors()], 422);
        }

        $name = $request->input('name');

        // Generate a short unique access code (letters+digits).
        $accessCode = null;
        for ($i = 0; $i < 8; $i++) {
            $candidate = strtoupper(Str::random(6));
            $exists = DB::table('trip_groups')->where('access_code', $candidate)->exists();
            if (! $exists) {
                $accessCode = $candidate;
                break;
            }
        }
        if (! $accessCode) {
            $accessCode = strtoupper(Str::random(8));
        }

        $groupId = DB::table('trip_groups')->insertGetId([
            'access_code' => $accessCode,
            'name' => $name,
            'created_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('trip_group_members')->insert([
            'group_id' => $groupId,
            'user_id' => $user->id,
            'user_email' => $user->email ?? null,
            'user_name' => $user->name ?? null,
            'role' => 'Leader',
            'joined_at' => now(),
        ]);

        DB::table('trip_group_messages')->insert([
            'group_id' => $groupId,
            'user_id' => null,
            'sender_email' => 'system',
            'sender_name' => 'System',
            'text' => trim(($user->name ?? 'A user') . ' created the group'),
            'type' => 'system',
            'attachment' => null,
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->groupPayload((int) $groupId),
        ], 201);
    }

    public function join(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'access_code' => 'required|string|max:12',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid payload', 'errors' => $validator->errors()], 422);
        }

        $code = strtoupper(preg_replace('/\s+/', '', (string) $request->input('access_code')));
        $group = DB::table('trip_groups')->where('access_code', $code)->first();
        if (! $group) {
            return response()->json(['success' => false, 'message' => 'Invalid access code'], 404);
        }

        $groupId = (int) $group->id;

        $alreadyMember = $this->requireMember($groupId, (int) $user->id);
        if (! $alreadyMember) {
            DB::table('trip_group_members')->insert([
                'group_id' => $groupId,
                'user_id' => $user->id,
                'user_email' => $user->email ?? null,
                'user_name' => $user->name ?? null,
                'role' => 'Member',
                'joined_at' => now(),
            ]);

            DB::table('trip_group_messages')->insert([
                'group_id' => $groupId,
                'user_id' => null,
                'sender_email' => 'system',
                'sender_name' => 'System',
                'text' => trim(($user->name ?? 'A user') . ' joined the group'),
                'type' => 'system',
                'attachment' => null,
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->groupPayload($groupId),
        ]);
    }

    public function show(Request $request, $groupId)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $groupId = (int) $groupId;
        if (! $this->requireMember($groupId, (int) $user->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $payload = $this->groupPayload($groupId);
        if (! $payload) {
            return response()->json(['message' => 'Group not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $payload]);
    }

    public function sendMessage(Request $request, $groupId)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $groupId = (int) $groupId;
        if (! $this->requireMember($groupId, (int) $user->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'text' => 'nullable|string',
            'attachment' => 'nullable',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid payload', 'errors' => $validator->errors()], 422);
        }

        $text = (string) ($request->input('text') ?? '');
        $attachment = $request->input('attachment');
        if (trim($text) === '' && empty($attachment)) {
            return response()->json(['message' => 'Message is empty'], 422);
        }

        $messageId = DB::table('trip_group_messages')->insertGetId([
            'group_id' => $groupId,
            'user_id' => $user->id,
            'sender_email' => $user->email ?? null,
            'sender_name' => $user->name ?? null,
            'text' => $text,
            'type' => 'user',
            'attachment' => $attachment ? json_encode($attachment) : null,
            'created_at' => now(),
        ]);

        $message = DB::table('trip_group_messages')->where('id', $messageId)->first();

        return response()->json([
            'success' => true,
            'data' => $message,
        ], 201);
    }

    public function messages(Request $request, $groupId)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $groupId = (int) $groupId;
        if (! $this->requireMember($groupId, (int) $user->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = DB::table('trip_group_messages')
            ->where('group_id', $groupId)
            ->orderBy('id', 'asc')
            ->limit(200)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }
}
