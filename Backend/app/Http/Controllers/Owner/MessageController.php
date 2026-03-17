<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
class MessageController extends Controller
{

    public function index()
    {
        $ownerId = auth()->id();

        $messages = Message::where('sender_id',$ownerId)
            ->orWhere('receiver_id',$ownerId)
            ->with(['sender','receiver'])
            ->latest()
            ->get();

        return response()->json($messages);
    }

    public function conversation($customerId)
    {
        $ownerId = auth()->id();

        $messages = Message::where(function ($q) use ($ownerId,$customerId) {
            $q->where('sender_id',$ownerId)
              ->where('receiver_id',$customerId);
        })
        ->orWhere(function ($q) use ($ownerId,$customerId) {
            $q->where('sender_id',$customerId)
              ->where('receiver_id',$ownerId);
        })
        ->orderBy('created_at')
        ->get();

        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required'
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message
        ]);

        return response()->json($message);
    }
}