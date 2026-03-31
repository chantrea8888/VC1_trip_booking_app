<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;

class MessageController extends Controller
{
    /**
     * List all conversations/messages for the authenticated customer.
     */
    public function index()
    {
        $messages = Message::where('sender_id', auth()->id())
            ->orWhere('receiver_id', auth()->id())
            ->with('sender', 'receiver')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }

    /**
     * Show conversation with a specific owner.
     */
    public function conversation($ownerId)
    {
        $owner = User::findOrFail($ownerId);

        $conversation = Message::where(function ($q) use ($ownerId) {
                $q->where('sender_id', auth()->id())
                  ->where('receiver_id', $ownerId);
            })
            ->orWhere(function ($q) use ($ownerId) {
                $q->where('sender_id', $ownerId)
                  ->where('receiver_id', auth()->id());
            })
            ->with('sender', 'receiver')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'conversation' => $conversation
        ]);
    }

    /**
     * Send a message to an owner.
    */
    public function send(Request $request)
    {
        // Accept both 'message' and legacy 'content' keys to keep API stable.
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:2000',
            'content' => 'nullable|string|max:2000',
        ]);

        $text = trim((string) ($request->input('message') ?? $request->input('content') ?? ''));
        if ($text === '') {
            return response()->json(['success' => false, 'message' => 'Message cannot be empty.'], 422);
        }

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $text,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message
        ], 201);
    }

    public function unreadCount()
    {
        $userId = auth()->id();
        $count = Message::where('receiver_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
