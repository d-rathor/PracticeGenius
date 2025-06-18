import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import SubscriptionService, { Subscription } from '@/services/subscription.service';

const DashboardPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('practicegenius_token');
    if (!token) {
      window.location.href = '/auth/login?redirect=/dashboard';
      return;
    }

    const fetchSubscription = async () => {
      try {
        const subscriptionData = await SubscriptionService.getCurrentSubscription();
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
