import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerifiedEmail?: boolean;
}

/**
 * Component to protect routes based on authentication and roles
 * Redirects to login if not authenticated
 * Redirects to dashboard if not admin (when requireAdmin is true)
 * Redirects to email verification if email not verified (when requireVerifiedEmail is true)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireVerifiedEmail = false,
}) => {
  const { isAuthenticated, isLoading, isAdmin, isEmailVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!isAuthenticated) {
        router.replace(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Check admin role if required
      if (requireAdmin && !isAdmin()) {
        router.replace('/dashboard');
        return;
      }

      // Check email verification if required
      if (requireVerifiedEmail && !isEmailVerified()) {
        router.replace('/auth/verify-email?required=true');
        return;
      }
    }
  }, [isLoading, isAuthenticated, requireAdmin, requireVerifiedEmail, isAdmin, isEmailVerified, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If all checks pass, render children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
