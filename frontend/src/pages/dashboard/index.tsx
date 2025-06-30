import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import SubscriptionService, { Subscription } from '@/services/subscription.service';
import { SubscriptionPlan } from '@/types/types';
import PlanGrid from '@/components/dashboard/PlanGrid';

const DashboardPage: React.FC = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('practicegenius_token');
    if (!token) {
      window.location.href = '/auth/login?redirect=/dashboard';
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [plansResponse, subscriptionApiResponse] = await Promise.all([
          SubscriptionService.getSubscriptionPlans(),
          SubscriptionService.getCurrentSubscription(),
        ]);

        setAllPlans(plansResponse || []);
        
        const actualSubscription = subscriptionApiResponse?.success ? subscriptionApiResponse.data : null;
        setSubscription(actualSubscription);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            <Link 
              href="/dashboard/worksheets" 
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-300"
            >
              Browse Worksheets
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Subscription Status Card */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Subscription Status</h2>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="font-medium text-lg">{subscription?.plan?.name || 'No active plan'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/subscription" 
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Manage Subscription →
                </Link>
              </CardFooter>
            </Card>

            {/* Available Plans Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
              <PlanGrid 
                plans={allPlans}
                currentSubscription={subscription}
                showActions={false}
              />
              <p className="text-center text-sm text-gray-600 mt-6">
                If you want to upgrade/change your plans, please click on{' '}
                <Link href="/dashboard/subscription" className="text-orange-500 hover:underline font-medium">
                  Subscription
                </Link>
                {' '}on the left hand side.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
