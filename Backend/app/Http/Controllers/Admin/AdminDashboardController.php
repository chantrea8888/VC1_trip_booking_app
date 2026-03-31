<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\OwnerProfile;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStatistics()
    {
        $totalUsers = User::where('role', 'customer')->count();
        $totalOwners = User::where('role', 'owner')->count();
        $totalBookings = Booking::count();
        $systemIncome = Booking::sum('total_amount') ?? 0;

        // Get trend percentages (vs last month)
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        $currentMonthStart = Carbon::now()->startOfMonth();

        $usersLastMonth = User::where('role', 'customer')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
        $usersThisMonth = User::where('role', 'customer')
            ->where('created_at', '>=', $currentMonthStart)
            ->count();
        $usersTrend = $usersLastMonth > 0 ? round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100, 1) : 0;

        $ownersLastMonth = User::where('role', 'owner')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
        $ownersThisMonth = User::where('role', 'owner')
            ->where('created_at', '>=', $currentMonthStart)
            ->count();
        $ownersTrend = $ownersLastMonth > 0 ? round((($ownersThisMonth - $ownersLastMonth) / $ownersLastMonth) * 100, 1) : 0;

        $bookingsLastMonth = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $bookingsThisMonth = Booking::where('created_at', '>=', $currentMonthStart)->count();
        $bookingsTrend = $bookingsLastMonth > 0 ? round((($bookingsThisMonth - $bookingsLastMonth) / $bookingsLastMonth) * 100, 1) : 0;

        $incomeLastMonth = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount') ?? 0;
        $incomeThisMonth = Booking::where('created_at', '>=', $currentMonthStart)->sum('total_amount') ?? 0;
        $incomeTrend = $incomeLastMonth > 0 ? round((($incomeThisMonth - $incomeLastMonth) / $incomeLastMonth) * 100, 1) : 0;

        return response()->json([
            'totalUsers' => $totalUsers,
            'usersTrend' => $usersTrend,
            'totalOwners' => $totalOwners,
            'ownersTrend' => $ownersTrend,
            'totalBookings' => $totalBookings,
            'bookingsTrend' => $bookingsTrend,
            'systemIncome' => $systemIncome,
            'incomeTrend' => $incomeTrend,
        ]);
    }

    /**
     * Get income overview data by time range
     */
    public function getIncomeOverview(Request $request)
    {
        $range = $request->query('range', '1M');
        $data = [];

        switch ($range) {
            case '1W':
                // Last 7 days
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i);
                    $dayName = $date->format('D');
                    $income = Booking::whereDate('created_at', $date)->sum('total_amount') ?? 0;
                    $expenses = round($income * 0.5); // Placeholder: assume 50% expenses
                    $data[] = [
                        'name' => $dayName,
                        'income' => $income,
                        'expenses' => $expenses,
                    ];
                }
                break;
            case '1Y':
                // Last 12 months
                for ($i = 11; $i >= 0; $i--) {
                    $date = Carbon::now()->subMonths($i);
                    $monthName = $date->format('M');
                    $income = Booking::whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->sum('total_amount') ?? 0;
                    $expenses = round($income * 0.5); // Placeholder: assume 50% expenses
                    $data[] = [
                        'name' => $monthName,
                        'income' => $income,
                        'expenses' => $expenses,
                    ];
                }
                break;
            case '1M':
            default:
                // Last 6 months
                for ($i = 5; $i >= 0; $i--) {
                    $date = Carbon::now()->subMonths($i);
                    $monthName = $date->format('M');
                    $income = Booking::whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->sum('total_amount') ?? 0;
                    $expenses = round($income * 0.5); // Placeholder: assume 50% expenses
                    $data[] = [
                        'name' => $monthName,
                        'income' => $income,
                        'expenses' => $expenses,
                    ];
                }
                break;
        }

        return response()->json($data);
    }

    /**
     * Get recent users
     */
    public function getRecentUsers(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        
        $users = User::latest('created_at')
            ->limit($perPage)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ucfirst($user->role),
                    'status' => $user->email_verified_at ? 'Active' : 'Pending',
                    'date' => $user->created_at->format('M d, Y'),
                ];
            });

        return response()->json($users);
    }

    /**
     * Get pending owner applications
     */
    public function getPendingOwners(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        
        $owners = User::where('role', 'owner')
            ->where('email_verified_at', null)
            ->with('ownerProfile')
            ->latest('created_at')
            ->limit($perPage)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'business' => $user->ownerProfile?->business_name ?? 'N/A',
                    'status' => 'Pending',
                    'date' => $user->created_at->format('M d, Y'),
                ];
            });

        return response()->json($owners);
    }

    /**
     * Get pending owners count
     */
    public function getPendingOwnersCount()
    {
        $count = User::where('role', 'owner')
            ->where('email_verified_at', null)
            ->count();

        return response()->json(['count' => $count]);
    }
}
