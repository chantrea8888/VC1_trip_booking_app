<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transport extends Model
{
    protected $primaryKey = 'transport_id';

    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'service_name',
        'transport_type',
        'price_per_km',
        'route_description',
        'service_details',
        'vehicle_photo_url',
        'status',
    ];
}
