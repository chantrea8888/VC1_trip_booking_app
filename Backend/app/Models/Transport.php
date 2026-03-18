<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Transport extends Model
{
    protected $primaryKey = 'transport_id';

    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'service_name',
        'transport_type',
        'price_per_km',
        'is_free',
        'route_description',
        'service_details',
        'vehicle_photo_url',
        'status',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'transport_id', 'transport_id');
    }

    public function getVehiclePhotoUrlAttribute($value): ?string
    {
        if (! $value) {
            return $value;
        }

        if (Str::startsWith($value, ['http://', 'https://', 'data:'])) {
            return $value;
        }

        $normalized = Str::startsWith($value, '/') ? $value : '/' . $value;
        return url($normalized);
    }
}
