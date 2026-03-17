<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'discount',
        'type',
        'expiry',
        'is_active',
        'service_category',
        'destination_id',
        'room_id',
        'transport_id',
    ];
}
