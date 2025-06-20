import apiClient from '@/lib/api';
import { AuthResponse, User, ApiResponse } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  // Add other updatable fields if necessary, e.g., email, but handle verification flow
}

export interface ChangePasswordData {
  currentPassword?: string; // Made optional to match service, but backend will require it
  newPassword?: string; // Made optional to match service, but backend will require it
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}


/**
 * Authentication service for handling user login, registration, and profile
 */
const AuthService = {
  /**
   * Login user with email and password
   * @param credentials User login credentials
   * @returns AuthResponse with token and user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      
      // Store token in localStorage (client-side only)
      if (typeof window !== 'undefined' && response.token) {
        localStorage.setItem('practicegenius_token', response.token);
      }
      
      // Add success flag for consistent response handling
      return { ...response, success: true };

    } catch (error: any) {
      // Return a standardized error object to prevent crashes
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during login.',
        token: null,
        user: null,
      };
    }
  },
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns AuthResponse with token and user data
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    
    // Store token in localStorage (client-side only)
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('practicegenius_token', response.token);
    }
    
    return response;
  },
  
  /**
   * Get current user profile
   * @returns User profile data
   */
  async getProfile(): Promise<ApiResponse<User>> { // Assuming /api/auth/me returns ApiResponse<User>
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return response;
  },
  
  /**
   * Update user profile
   * @param profileData Partial user data to update, e.g., { name: 'New Name' }
   * @returns AuthResponse with updated user data
   */
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/api/auth/profile', profileData);
    // Optionally, update local user data if the API returns the full user object
    // and if you're managing user state globally (e.g., in a context or store)
    return response;
  },

  /**
   * Change user password
   * @param passwordData Object containing currentPassword and newPassword
   * @returns AuthResponse (or a specific message response if API is designed that way)
   */
  async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse<{ message?: string; user?: User }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ message?: string; user?: User }>>('/api/auth/password', passwordData);
      return response;
    } catch (error: any) {
      // Gracefully handle API errors by returning a standard response object
      // instead of letting the exception crash the app.
      return {
        success: false,
        message: error.message || 'Failed to change password.',
        // The UI primarily uses the top-level message, but we provide a data object
        // to satisfy the ApiResponse<T> type.
        data: { message: error.message },
      };
    }
  },

  /**
   * Logout user by removing token
   */
  logout() {
    // Only run on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('practicegenius_token');
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns boolean indicating if user is authenticated
   */
  isAuthenticated(): boolean {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('practicegenius_token');
      return !!token;
    }
    return false;
  }
};

export default AuthService;
