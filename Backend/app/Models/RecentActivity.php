<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecentActivity extends Model
{
    protected $table = 'recent_activities';

    protected $primaryKey = 'activity_id';

    public $incrementing = true;

    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'user_id',
        'notification_id',
        'activity_type',
        'title',
        'description',
        'activity_data',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'activity_data' => 'array',
        'created_at' => 'datetime',
    ];
}
