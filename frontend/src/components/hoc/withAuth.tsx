import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Higher-order component for protecting routes that require authentication
 * @param Component - The component to wrap with authentication protection
 * @param options - Configuration options for the HOC
 * @returns A new component with authentication protection
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    adminOnly?: boolean;
    redirectTo?: string;
  } = {}
) {
  const { adminOnly = false, redirectTo = '/auth/login' } = options;

  const WithAuth = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, isAdmin, isLoading } = useAuthContext();

    useEffect(() => {
      // If authentication check is complete
      if (!isLoading) {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          router.replace({
            pathname: redirectTo,
            query: { returnUrl: router.asPath }
          });
        }
        // If admin-only route but user is not admin
        else if (adminOnly && !isAdmin) {
          router.replace('/dashboard');
        }
      }
    }, [isAuthenticated, isAdmin, isLoading, router, redirectTo]);

    // Show loading spinner while checking authentication
    if (isLoading || (!isAuthenticated || (adminOnly && !isAdmin))) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    // If authenticated (and admin if required), render the component
    return <Component {...props} />;
  };

  // Copy display name from the wrapped component
  WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WithAuth;
}

export default withAuth;
