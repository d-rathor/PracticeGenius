import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
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
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store token in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns AuthResponse with token and user data
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    
    // Store token in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
  
  /**
   * Get current user profile
   * @returns User profile data
   */
  async getProfile() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  /**
   * Logout user by removing token
   */
  logout() {
    // Only run on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns boolean indicating if user is authenticated
   */
  isAuthenticated(): boolean {
    // Only run on client side
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }
};

export default AuthService;
