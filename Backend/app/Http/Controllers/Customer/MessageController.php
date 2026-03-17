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
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message
        ], 201);
    }
}