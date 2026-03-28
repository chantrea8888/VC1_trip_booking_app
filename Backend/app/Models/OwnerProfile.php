<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwnerProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'avatar',
        'bio',
        'date_of_birth',
        'gender',
        'business_name',
        'business_address',
        'business_registration_number',
        'tax_id',
        'business_phone_number',
        'commision_rate',
        'payment_terms',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'verification_document',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
