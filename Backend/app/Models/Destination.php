<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    protected $primaryKey = 'destination_id';
    public $incrementing = true;
    protected $keyType = 'int';

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

    protected $appends = ['id'];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
        'total_bookings' => 'integer',
    ];

    public function getIdAttribute(): ?int
    {
        return $this->attributes[$this->primaryKey] ?? null;
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
