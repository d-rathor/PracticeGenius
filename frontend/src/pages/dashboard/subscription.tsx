import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import SubscriptionService, { Subscription } from '@/services/subscription.service';
import { SubscriptionPlan } from '@/types/types';
import PlanGrid from '@/components/dashboard/PlanGrid';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  INR: '₹',
  // Add other currencies as needed
};

const SubscriptionPage: React.FC = () => {
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState<string | null>(null); // Store planId being switched to

  const fetchSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        SubscriptionService.getSubscriptionPlans(),
        SubscriptionService.getCurrentSubscription(),
      ]);

      setAllPlans(plansResponse || []);

      const actualSubscriptionData = subscriptionResponse?.success ? subscriptionResponse.data : null;
      setCurrentSubscription(actualSubscriptionData);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setCurrentSubscription(null); // Ensure state is null on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);



  const handleSwitchPlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to switch your subscription plan?')) {
      return;
    }

    const selectedPlan = allPlans.find((p) => p._id === planId);
    if (!selectedPlan) {
      console.error('Selected plan not found!');
      alert('An error occurred. Please try refreshing the page.');
      return;
    }

    setIsSwitching(planId);
    try {
      const response = await SubscriptionService.createSubscription({
        planId,
        amount: selectedPlan.price.monthly,
        paymentMethod: 'card', // Placeholder
        billingCycle: 'monthly',
        autoRenew: true,
      });

      if (response && response.success) {
        alert('Plan switched successfully!');
        setCurrentSubscription(response.data); // Use the returned subscription data to update the UI
      } else {
        throw new Error(response.message || 'Failed to switch plan');
      }
    } catch (error) {
      console.error('Error switching subscription plan:', error);
      alert('Failed to switch subscription plan. Please try again.');
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Current Subscription */}
            {currentSubscription && currentSubscription.plan ? (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Current Subscription</h2>
                    <Badge variant={currentSubscription.status === 'active' ? 'success' : 'warning'}>
                      {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-medium">{currentSubscription.plan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">{currencySymbols[currentSubscription.plan.currency || 'USD'] || '$'}{currentSubscription.plan.price.monthly} / month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{new Date(currentSubscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{new Date(currentSubscription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                   <h2 className="text-xl font-semibold">No Active Subscription</h2>
                </CardHeader>
                <CardContent>
                  <p>You do not have an active subscription. Please choose a plan below.</p>
                </CardContent>
              </Card>
            )}

            {/* Available Plans */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Available Plans</h2>
                        <PlanGrid 
              plans={allPlans}
              currentSubscription={currentSubscription}
              showActions={true}
              onSwitchPlan={handleSwitchPlan}
              isSwitching={isSwitching}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
