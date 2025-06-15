import api from './api';

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
    console.log('[UserService.getUsers] Using apiClient with API_BASE_URL:', api.API_BASE_URL);
    console.log('[UserService.getUsers] apiClient object reference check:', typeof api.get === 'function' ? 'api.get is a function' : 'api.get is NOT a function or api is unexpected');
    try {
      const response = await api.get('/api/users', {
        params: { page, limit }
      });
      console.log('[UserService.getUsers] Successfully fetched users (response status will be in network tab):', response ? 'Response received' : 'No response object');
      return response.data;
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
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  
  /**
   * Update user profile
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user
   */
  async updateUser(id: string, userData: UpdateUserData) {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  
  /**
   * Delete user
   * @param id User ID
   * @returns Success message
   */
  async deleteUser(id: string) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
  
  /**
   * Get user download history
   * @param id User ID
   * @returns User's download history
   */
  async getUserDownloadHistory(id: string) {
    const response = await api.get(`/api/users/${id}/downloads`);
    return response.data;
  },
  
  /**
   * Get recent users (admin only)
   * @param limit Number of users to return
   * @returns Array of recent users
   */
  async getRecentUsers(limit: number = 5) {
    const response = await api.get('/api/users/recent', {
      params: { limit }
    });
    return response.data;
  }
};

export default UserService;
