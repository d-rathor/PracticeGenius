import apiClient from '@/lib/api';

export interface AdminStats {
  totalUsers: number;
  totalWorksheets: number;
}

// Define the shape of the API response
interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

const AdminService = {
  /**
   * Get admin dashboard stats
   * @returns Admin stats data
   */
  async getStats(): Promise<AdminStats> {
    try {
      // Provide the expected response type to the generic get method
      const response = await apiClient.get<AdminStatsResponse>('/admin/stats');
      // The API wraps the data in a `data` property, so we extract it
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },
};

export default AdminService;
