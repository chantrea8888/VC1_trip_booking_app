<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelSelection extends Model
{
    use HasFactory;

    protected $table = 'hotel_selections';

    protected $fillable = [
        'customer_id',
        'hotel_id',
        'booking_id',
        'check_in_date',
        'check_out_date',
        'number_of_rooms',
        'number_of_guests',
        'room_type',
        'special_requests',
        'total_price',
        'status',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'number_of_rooms' => 'integer',
        'number_of_guests' => 'integer',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the customer who selected this hotel
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the selected hotel (accommodation)
     */
    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class, 'hotel_id');
    }

    /**
     * Get the associated booking (note: booking_id is a string, not a foreign key constraint)
     */
    public function booking()
    {
        return $this->hasOne(Booking::class, 'id', 'booking_id');
    }

    /**
     * Scope to get active selections
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed']);
    }

    /**
     * Scope to get selections by customer
     */
    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Calculate number of nights
     */
    public function getNumberOfNightsAttribute()
    {
        if ($this->check_in_date && $this->check_out_date) {
            return $this->check_out_date->diffInDays($this->check_in_date);
        }
        return 0;
    }
}
