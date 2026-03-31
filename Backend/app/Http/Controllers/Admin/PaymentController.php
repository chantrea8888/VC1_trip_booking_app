<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = DB::table('payments')
            ->leftJoin('hotel_bookings', 'payments.booking_id', '=', 'hotel_bookings.id')
            ->leftJoin('users', 'hotel_bookings.user_id', '=', 'users.id')
            ->leftJoin('hotels', 'hotel_bookings.hotel_id', '=', 'hotels.id')
            ->select([
                'payments.id',
                'payments.booking_id',
                'payments.amount',
                'payments.payment_method',
                'payments.status',
                'payments.transaction_id',
                'payments.payment_date',
                'payments.notes',
                'payments.created_at',
                'payments.updated_at',
                'users.name as customer_name',
                'users.email as customer_email',
                'hotels.hotel_name',
            ])
            ->orderByRaw('COALESCE(payments.payment_date, payments.created_at) DESC')
            ->orderByDesc('payments.id')
            ->get();

        return response()->json([
            'message' => 'Payments fetched successfully',
            'data' => $payments,
            'meta' => $this->buildSummary($payments),
        ]);
    }

    private function buildSummary(Collection $payments): array
    {
        $sumAmountForStatus = static fn (string $status): float => (float) $payments
            ->where('status', $status)
            ->sum(static fn (object $payment): float => (float) ($payment->amount ?? 0));

        return [
            'total_count' => $payments->count(),
            'total_amount' => (float) $payments->sum(static fn (object $payment): float => (float) ($payment->amount ?? 0)),
            'completed_count' => $payments->where('status', 'completed')->count(),
            'completed_amount' => $sumAmountForStatus('completed'),
            'pending_count' => $payments->where('status', 'pending')->count(),
            'pending_amount' => $sumAmountForStatus('pending'),
            'refunded_count' => $payments->where('status', 'refunded')->count(),
            'refunded_amount' => $sumAmountForStatus('refunded'),
            'failed_count' => $payments->where('status', 'failed')->count(),
            'failed_amount' => $sumAmountForStatus('failed'),
        ];
    }
}
