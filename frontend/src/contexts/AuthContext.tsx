import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types'; // Import the canonical User type

// Auth context state
interface AuthContextState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
});

/**
 * Auth context provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // This effect runs once on mount to hydrate auth state from localStorage
    const token = localStorage.getItem('practicegenius_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear potentially corrupt data
        localStorage.removeItem('user');
        localStorage.removeItem('practicegenius_token');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Derived state is more robust and prevents sync issues
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns Auth context state
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component to protect routes that require authentication
 * @param Component Component to protect
 * @param adminOnly Whether route is admin-only
 * @returns Protected component
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>, adminOnly: boolean = false) {
  const WithAuth: React.FC<P> = (props) => {
    const { user, isAuthenticated, isLoading, isAdmin } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        // Check token directly from localStorage as a backup
        const token = localStorage.getItem('practicegenius_token');
        const userStr = localStorage.getItem('user');
        let userRole = '';
        
        try {
          if (userStr) {
            const userData = JSON.parse(userStr);
            userRole = userData.role;
          }
        } catch (error) {
          console.error('Error parsing user data in withAuth:', error);
        }
        
        // If not authenticated, redirect to login
        if (!isAuthenticated || !token) {
          console.log('Not authenticated, redirecting to login');
          // Clear any stale tokens or user data
          localStorage.removeItem('practicegenius_token');
          localStorage.removeItem('user');
          window.location.href = `/auth/login?redirect=${encodeURIComponent(router.asPath)}`;
          return;
        }

        // If admin-only route and user is not admin, redirect to dashboard
        if (adminOnly) {
          // Check both the context state and the localStorage backup
          const isUserAdmin = isAdmin || userRole === 'admin';
          if (!isUserAdmin) {
            console.log('Not admin, redirecting to dashboard');
            window.location.href = '/dashboard';
            return;
          }
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, adminOnly, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    // Render component with props
    return <Component {...props} />;
  };

  return WithAuth;
}

export default AuthContext;
