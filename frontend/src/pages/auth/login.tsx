import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import apiClient from '@/lib/api'; // Import apiClient

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { redirect } = router.query;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email });
      
      // Use apiClient for the login request
      console.log(`Sending login request to: ${apiClient.API_BASE_URL}/api/auth/login`);
      const data = await apiClient.post('/api/auth/login', { email, password });
      // apiClient.post already returns the JSON data and handles response status checking internally
      // If an error occurs (non-2xx response), apiClient.post will throw an error which is caught below.
      console.log('Login response data:', data);
      
      // Store token in localStorage
      console.log('About to store token:', data.token ? 'Token exists' : 'No token in response');
      localStorage.setItem('practicegenius_token', data.token);
      console.log('Token stored in localStorage');
      
      // Store user info in localStorage
      if (data.user) {
        console.log('User data received:', data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User info stored in localStorage:', data.user);
      } else {
        console.error('No user data in response');
      }
      
      // Verify localStorage after setting
      const storedToken = localStorage.getItem('practicegenius_token');
      const storedUser = localStorage.getItem('user');
      console.log('Verification - Token in localStorage:', storedToken ? 'Token exists' : 'No token');
      console.log('Verification - User in localStorage:', storedUser ? 'User exists' : 'No user');
      
      // Determine redirect path based on user role
      const userObj = data.user || (storedUser ? JSON.parse(storedUser) : null);
      const redirectPath = userObj?.role === 'admin' 
        ? '/admin/dashboard' 
        : redirect ? decodeURIComponent(redirect as string) : '/dashboard';
      
      console.log('User role:', userObj?.role);
      console.log('Redirecting to:', redirectPath);
      
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        // Force a complete page reload to ensure token is picked up
        console.log('About to redirect to:', redirectPath);
        
        // Use window.location.assign for a cleaner navigation approach
        // This creates a new navigation entry in the browser history
        window.location.assign(redirectPath);
        
        // Fallback redirect in case the first one doesn't work
        setTimeout(() => {
          if (window.location.pathname.includes('/auth/login')) {
            console.log('Fallback redirect triggered');
            window.location.href = redirectPath;
          }
        }, 1000);
      }, 500);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide more user-friendly error messages
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err instanceof SyntaxError) {
        setError('The server response was invalid. Please try again later.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-gray-600 mt-1">Sign in to your account</p>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center" role="alert">
                  <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="block sm:inline font-medium">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link href="/auth/reset-password" className="text-sm text-orange-500 hover:text-orange-600">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>

              {/* Social login buttons removed */}

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href={redirect ? `/auth/signup?redirect=${redirect}` : '/auth/signup'} 
                    className="font-medium text-orange-500 hover:text-orange-600"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
