import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';

const SetupSubscriptionPlansPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post<{results: any}>('/api/admin/create-subscription-plans', {});
      setResults(response.results);
      
      // Refresh subscription plans list
      await api.get('/api/admin/subscription-plans');
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating subscription plans');
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Setup Subscription Plans</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Create Subscription Plans</h2>
            <p className="text-gray-600">
              This will create the Basic, Premium, and Professional subscription plans in the database.
            </p>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This action will create the following subscription plans:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Basic</strong> ($9.99/month): For individual students or parents</li>
              <li><strong>Premium</strong> ($19.99/month): For families and homeschooling</li>
              <li><strong>Professional</strong> ($49.99/month): For teachers and educational institutions</li>
            </ul>
            <p className="text-sm text-gray-600">
              Note: If plans with the same names already exist, they may be duplicated.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreatePlans} 
              disabled={isLoading}
              className="mr-4"
            >
              {isLoading ? 'Creating Plans...' : 'Create Subscription Plans'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/subscription-plans')}
            >
              Go to Subscription Plans
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {results && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Results</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Plan Name</th>
                      <th className="py-2 px-4 border-b">Status</th>
                      <th className="py-2 px-4 border-b">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result: any, index: number) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border-b">{result.name}</td>
                        <td className="py-2 px-4 border-b">
                          {result.success ? (
                            <span className="text-green-600">Success</span>
                          ) : (
                            <span className="text-red-600">Failed</span>
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {result.success ? (
                            <span>Plan created successfully</span>
                          ) : (
                            <span>{result.error || 'Unknown error'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SetupSubscriptionPlansPage;
