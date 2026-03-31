import { apiRequest } from './api';

export interface DashboardStatistics {
  totalUsers: number;
  usersTrend: number;
  totalOwners: number;
  ownersTrend: number;
  totalBookings: number;
  bookingsTrend: number;
  systemIncome: number;
  incomeTrend: number;
}

export interface IncomeDataPoint {
  name: string;
  income: number;
  expenses: number;
}

export interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  role: 'User' | 'Owner' | 'Admin';
  status: 'Active' | 'Pending';
  date: string;
}

export interface PendingOwner {
  id: string | number;
  name: string;
  email: string;
  business: string;
  status: 'Pending';
  date: string;
}

class AdminDashboardService {
  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<DashboardStatistics> {
    return apiRequest<DashboardStatistics>('/admin/dashboard/statistics');
  }

  /**
   * Get income overview data by time range
   * @param range '1W' | '1M' | '1Y'
   */
  async getIncomeOverview(range: '1W' | '1M' | '1Y' = '1M'): Promise<IncomeDataPoint[]> {
    return apiRequest<IncomeDataPoint[]>(`/admin/dashboard/income-overview?range=${range}`);
  }

  /**
   * Get recent users
   */
  async getRecentUsers(perPage: number = 10): Promise<RecentUser[]> {
    return apiRequest<RecentUser[]>(`/admin/dashboard/recent-users?per_page=${perPage}`);
  }

  /**
   * Get pending owner applications
   */
  async getPendingOwners(perPage: number = 10): Promise<PendingOwner[]> {
    return apiRequest<PendingOwner[]>(`/admin/dashboard/pending-owners?per_page=${perPage}`);
  }

  /**
   * Get pending owners count
   */
  async getPendingOwnersCount(): Promise<{ count: number }> {
    return apiRequest<{ count: number }>('/admin/dashboard/pending-owners-count');
  }
}

export const adminDashboardService = new AdminDashboardService();
