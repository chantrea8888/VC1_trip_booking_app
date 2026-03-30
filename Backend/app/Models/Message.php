<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        // Backwards compatibility: some controllers/clients use `content`.
        'content',
    ];

    protected $appends = [
        'content',
    ];

    public function getContentAttribute(): ?string
    {
        return $this->attributes['message'] ?? null;
    }

    public function setContentAttribute($value): void
    {
        $this->attributes['message'] = $value;
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
