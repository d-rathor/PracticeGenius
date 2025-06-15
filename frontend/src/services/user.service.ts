import apiClient from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  activeSubscription?: string;
  downloadHistory?: Array<{
    worksheet: string;
    downloadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

/**
 * User service for handling user management
 * Replaces localStorage usage with backend API calls
 */
const UserService = {
  /**
   * Get all users (admin only)
   * @param page Page number
   * @param limit Items per page
   * @returns Array of users and pagination data
   */
  async getUsers(page: number = 1, limit: number = 10) {
    console.log('[UserService.getUsers] Attempting to fetch users.');
    console.log('[UserService.getUsers] Using apiClient with API_BASE_URL:', apiClient.API_BASE_URL);
    console.log('[UserService.getUsers] apiClient object reference check:', typeof apiClient.get === 'function' ? 'apiClient.get is a function' : 'apiClient.get is NOT a function or apiClient is unexpected');
    try {
      const response = await apiClient.get<{ data: User[] }>('/api/users', {
        params: { page, limit }
      });
      console.log('[UserService.getUsers] Successfully fetched users (response status will be in network tab):', response ? 'Response received' : 'No response object');
      // The API returns a paginated object, and the users are in the 'data' property.
      return response.data || [];
    } catch (error) {
      console.error('[UserService.getUsers] Error fetching users in UserService:', error);
      throw error;
    }
  },
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns User data
   */
  async getUserById(id: string) {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response;
  },
  
  /**
   * Update user profile
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user
   */
  async updateUser(id: string, userData: UpdateUserData) {
    const response = await apiClient.put<User>(`/api/users/${id}`, userData);
    return response;
  },
  
  /**
   * Delete user
   * @param id User ID
   * @returns Success message
   */
  async deleteUser(id: string) {
    const response = await apiClient.delete<any>(`/api/users/${id}`);
    return response;
  },
  
  /**
   * Get user download history
   * @param id User ID
   * @returns User's download history
   */
  async getUserDownloadHistory(id: string) {
    const response = await apiClient.get<Array<{ worksheet: string; downloadedAt: string; }>>(`/api/users/${id}/downloads`);
    return response;
  },
  
  /**
   * Get recent users (admin only)
   * @param limit Number of users to return
   * @returns Array of recent users
   */
  async getRecentUsers(limit: number = 5) {
    const response = await apiClient.get<User[]>('/api/users/recent', {
      params: { limit }
    });
    return response;
  }
};

export default UserService;
