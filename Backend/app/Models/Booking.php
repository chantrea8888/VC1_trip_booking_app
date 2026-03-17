<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'guest',
        'service',
        'route',
        'dateStart',
        'dateEnd',
        'date',
        'time',
        'pax',
        'amount',
        'status',
        'category',
        'roomType',
        'vehicleType',
        'customerEmail',
        'customerPhone',
        'specialRequests',
        'paymentMethod',
        'createdAt',
        'user_id',
        'destination_id',
        'transport_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'pax' => 'integer',
        'destination_id' => 'integer',
        'transport_id' => 'integer',
        'dateStart' => 'date',
        'dateEnd' => 'date',
        'date' => 'date',
        'createdAt' => 'datetime'
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
