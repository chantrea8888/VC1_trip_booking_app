<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    protected $primaryKey = 'destination_id';

    protected $keyType = 'int';

    public $incrementing = true;

    protected $appends = ['id'];

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'description',
        'location',
        'address',
        'price',
        'image',
        'images',
        'rating',
        'total_bookings',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
        'total_bookings' => 'integer',
    ];

    public function getIdAttribute(): ?int
    {
        $value = $this->getAttribute('destination_id');

        return $value === null ? null : (int) $value;
    }

    /**
     * Get the user that owns this destination
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all bookings for this destination
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
