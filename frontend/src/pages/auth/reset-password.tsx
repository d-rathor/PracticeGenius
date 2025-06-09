import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // If token is present, we're in the "set new password" step
  // Otherwise, we're in the "request reset link" step
  const isResetStep = !!token;

  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = 
      (hasUpperCase ? 1 : 0) + 
      (hasLowerCase ? 1 : 0) + 
      (hasNumbers ? 1 : 0) + 
      (hasSpecialChars ? 1 : 0);
    
    if (strength < 3) {
      setPasswordStrength('weak');
    } else if (strength === 3) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link. Please try again.');
      }
      
      setSuccess('Password reset link has been sent to your email address. Please check your inbox.');
      setIsLoading(false);
      
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. Please try again.');
      }
      
      setSuccess('Your password has been successfully reset.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {isResetStep ? 'Reset Your Password' : 'Forgot Password'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isResetStep 
                    ? 'Enter your new password below' 
                    : 'Enter your email and we\'ll send you a link to reset your password'}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{success}</span>
                </div>
              )}
              
              {isResetStep ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your new password"
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getPasswordStrengthColor()} h-2 rounded-full`}
                              style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Password should be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !!success}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-6">
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
                    <button
                      type="submit"
                      disabled={isLoading || !!success}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending reset link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-medium text-orange-500 hover:text-orange-600">
                    Sign in
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

export default ResetPasswordPage;
