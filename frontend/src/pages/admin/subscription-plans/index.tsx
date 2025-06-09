import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { withAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Feature {
  id: string;
  name: string;
  description: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Feature[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminSubscriptionPlans: React.FC = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Fetch subscription plans data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await api.get<SubscriptionPlan[]>('/api/admin/subscription-plans');
        setPlans(data);
        
      } catch (err: any) {
        console.error('Error fetching subscription plans:', err);
        setError(err.message || 'Failed to load subscription plans. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle plan deletion
  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admin/subscription-plans/${planId}`);
        
        // Remove the deleted plan from state
        setPlans(plans.filter(plan => plan.id !== planId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete plan');
      }
    }
  };

  // Handle toggling plan active status
  const handleToggleActive = async (planId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/admin/subscription-plans/${planId}`, {
        isActive: !currentStatus
      });
      
      // Update the plan status in state
      setPlans(plans.map(plan => 
        plan.id === planId 
          ? { ...plan, isActive: !currentStatus } 
          : plan
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update plan status');
    }
  };

  // Filter plans based on active status
  const filteredPlans = showInactive 
    ? plans 
    : plans.filter(plan => plan.isActive);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Subscription Plans</h1>
            <Link 
              href="/admin/subscription-plans/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-1 1h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Plan
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">All Subscription Plans</h2>
                  <p className="text-sm text-gray-500">
                    Manage subscription plans and their features
                  </p>
                </div>
                <div className="flex items-center">
                  <label htmlFor="show-inactive" className="mr-2 text-sm text-gray-700">
                    Show Inactive Plans
                  </label>
                  <input
                    type="checkbox"
                    id="show-inactive"
                    checked={showInactive}
                    onChange={() => setShowInactive(!showInactive)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              ) : filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.map((plan) => (
                    <div key={plan.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                      <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h3>
                          <div className="flex space-x-2">
                            {plan.isPopular && (
                              <Badge color="yellow">Popular</Badge>
                            )}
                            <Badge color={plan.isActive ? 'green' : 'gray'}>
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Monthly</span>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(plan.monthlyPrice)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Yearly</span>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(plan.yearlyPrice)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            <Link
                              href={`/admin/subscription-plans/${plan.id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                          <button
                            onClick={() => handleToggleActive(plan.id, plan.isActive)}
                            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${plan.isActive ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500' : 'border-transparent text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'}`}
                          >
                            {plan.isActive ? (
                              <>
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Deactivate
                              </>
                            ) : (
                              <>
                                <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No subscription plans found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {!showInactive && plans.length > 0
                      ? 'There are no active plans. Enable "Show Inactive Plans" to see all plans.'
                      : 'Get started by creating a new subscription plan.'}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/subscription-plans/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-1 1h-3a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Plan
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'} shown
                </p>
                <Link
                  href="/admin/subscriptions"
                  className="text-sm text-orange-600 hover:text-orange-900"
                >
                  View All Subscriptions
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap component with withAuth HOC and set adminOnly to true
export default withAuth(AdminSubscriptionPlans, true);
