<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'hotel_id',
        'room_number',
        'description',
        'room_floor',
    ];
}
