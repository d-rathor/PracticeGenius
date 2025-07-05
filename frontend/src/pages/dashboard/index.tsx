import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import PlanGrid from '@/components/dashboard/PlanGrid';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionPlan } from '@/types';

const DashboardPage: React.FC = () => {
  const { currentSubscription, subscriptionPlans, loading, error } = useSubscription();

  // Safely get the plan name
  const getPlanName = () => {
    if (!currentSubscription) return 'No active plan';
    if (typeof currentSubscription.plan === 'object' && currentSubscription.plan !== null) {
      return currentSubscription.plan.name;
    }
    // If plan is just an ID, find it in the plans list
    // Add a guard clause to ensure subscriptionPlans is an array before calling .find()
    if (!Array.isArray(subscriptionPlans)) {
      console.error('DashboardPage: subscriptionPlans is not an array when getPlanName was called.', subscriptionPlans);
      return 'Unknown Plan'; // or 'Loading...' or some other placeholder
    }
    const plan = subscriptionPlans.find(p => p._id === currentSubscription.plan);
    return plan ? plan.name : 'Unknown Plan';
  };

  // Get the current plan ID for the PlanGrid component
  const currentPlanId = currentSubscription?.plan
    ? (typeof currentSubscription.plan === 'object' ? currentSubscription.plan._id : currentSubscription.plan)
    : null;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {loading ? (
          <p>Loading your subscription details...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Subscription Status</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="text-xl font-bold">
                    {getPlanName()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/subscription" className="text-orange-500 hover:underline">
                      Manage Subscription &rarr;
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Available Plans</h2>
                </CardHeader>
                <CardContent>
                  <PlanGrid 
                    plans={subscriptionPlans} 
                    currentPlanId={currentPlanId}
                    showActions={false} 
                    onSwitchPlan={() => {}} // No action needed on this page
                    isSwitching={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
