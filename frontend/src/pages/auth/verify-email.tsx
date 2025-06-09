import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const { token, email } = router.query;
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // If token is present, verify the email
  // Otherwise, show the "check your email" screen
  useEffect(() => {
    if (token && !isVerifying && !success && !error) {
      verifyEmail(token as string);
    }
  }, [token]);

  // Countdown for resend button
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed. Please try again.');
      }
      
      setSuccess('Your email has been successfully verified.');
      
      // Store token in localStorage if provided
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('practicegenius_token', data.token);
      }
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err instanceof Error ? err.message : 'Email verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address is required to resend verification.');
      return;
    }
    
    try {
      setIsResending(true);
      setError(null);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email. Please try again.');
      }
      
      setSuccess('Verification email has been resent. Please check your inbox.');
      setIsResending(false);
      setCanResend(false);
      setCountdown(60);
      
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email. Please try again.');
      setIsResending(false);
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
                  {token ? 'Verifying Your Email' : 'Verify Your Email'}
                </h1>
                {!token && (
                  <p className="text-gray-600 mt-1">
                    We've sent a verification link to <strong>{email}</strong>
                  </p>
                )}
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
              
              {token ? (
                <div className="text-center py-4">
                  {isVerifying && !success && !error && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                      <p className="text-gray-600">Verifying your email address...</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-600">Redirecting to dashboard...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-4">
                      <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-800 mb-1">Check your inbox</h3>
                    <p className="text-blue-700">
                      We've sent a verification link to your email address. Please click the link to verify your account.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Didn't receive the email? Check your spam folder or click the button below to resend.
                    </p>
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending || !canResend}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resending...
                        </>
                      ) : !canResend ? (
                        `Resend in ${countdown}s`
                      ) : (
                        'Resend Verification Email'
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Return to{' '}
                  <Link href="/" className="font-medium text-orange-500 hover:text-orange-600">
                    Home
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

export default VerifyEmailPage;
