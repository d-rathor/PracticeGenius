import apiClient from '@/lib/api';
import { AuthResponse, User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
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
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store token in localStorage (client-side only)
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('practicegenius_token', response.token);
    }
    
    return response;
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
  async getProfile() {
    const response = await apiClient.get<any>('/api/auth/me');
    return response;
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
