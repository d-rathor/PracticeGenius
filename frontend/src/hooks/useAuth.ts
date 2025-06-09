import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';

// Define user and role types
export enum ROLES {
  ADMIN = 'admin',
  USER = 'user'
}

export interface PracticeGeniusUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  isEmailVerified?: boolean;
}

/**
 * Custom hook for authentication
 * Provides authentication state and methods with proper typing
 */
export function useAuth() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<PracticeGeniusUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('practicegenius_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as PracticeGeniusUser;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        // Clear invalid data
        localStorage.removeItem('practicegenius_token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   * @param redirectUrl URL to redirect after login
   */
  const login = async (email: string, password: string, redirectUrl?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('practicegenius_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      if (redirectUrl) {
        // Use window.location for a full page reload
        window.location.href = redirectUrl;
      }
      
      return true;
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout user and redirect
   * @param redirectUrl URL to redirect after logout
   */
  const logout = (redirectUrl: string = '/auth/login') => {
    try {
      setLoading(true);
      
      // Remove the token and user from localStorage
      localStorage.removeItem('practicegenius_token');
      localStorage.removeItem('user');
      
      // Clear any other potential auth-related items
      sessionStorage.removeItem('practicegenius_token');
      sessionStorage.removeItem('user');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Logout successful, redirecting to:', redirectUrl);
      
      // Use window.location for a full page reload
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed');
      setLoading(false);
    }
  };
  
  /**
   * Check if user has admin role
   * @returns True if user is admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === ROLES.ADMIN;
  }, [user]);
  
  /**
   * Check if user has a specific role
   * @param role Role to check
   * @returns True if user has the role
   */
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);
  
  /**
   * Check if user's email is verified
   * @returns True if email is verified
   */
  const isEmailVerified = useCallback(() => {
    return !!user?.isEmailVerified;
  }, [user]);
  
  /**
   * Get the authentication token for API requests
   * @returns The access token or null
   */
  const getAccessToken = useCallback(() => {
    return localStorage.getItem('practicegenius_token') || null;
  }, []);
  
  /**
   * Redirect to login if not authenticated
   * @param redirectPath Path to redirect to after login
   */
  const requireAuth = useCallback((redirectPath?: string) => {
    if (!isLoading && !isAuthenticated) {
      const path = redirectPath || router.asPath;
      router.push(`/auth/login?returnUrl=${encodeURIComponent(path)}`);
    }
  }, [isLoading, isAuthenticated, router]);
  
  /**
   * Redirect to dashboard if not admin
   */
  const requireAdmin = useCallback(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      } else if (!isAdmin()) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    loading,
    error,
    login,
    logout,
    isAdmin,
    hasRole,
    isEmailVerified,
    getAccessToken,
    requireAuth,
    requireAdmin,
    ROLES,
  };
}

export default useAuth;
