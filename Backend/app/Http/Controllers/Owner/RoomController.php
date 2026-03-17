<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $ownerId = $request->user()->id;

        $rooms = DB::table('rooms')
            ->join('hotels', 'rooms.hotel_id', '=', 'hotels.id')
            ->where('hotels.owner_id', $ownerId)
            ->select([
                'rooms.id',
                'rooms.room_number',
                'rooms.room_floor',
                'rooms.description',
                'rooms.hotel_id',
                'hotels.hotel_name',
            ])
            ->orderBy('rooms.id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }
}
