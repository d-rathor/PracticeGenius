import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import SubscriptionService, { Subscription } from '@/services/subscription.service';
import { SubscriptionPlan } from '@/types/types';

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allPlans.map((plan) => (
                <Card key={plan._id} className={`relative ${plan.name === 'Premium' ? 'border-2 border-orange-500' : ''}`}>
                  {plan.name === 'Premium' && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-bl">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{currencySymbols[plan.currency || 'USD'] || '$'}{plan.price.monthly}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <button 
                      onClick={() => handleSwitchPlan(plan._id)}
                      className={`w-full py-2 px-4 rounded text-center font-medium transition duration-300 ${
                        plan._id === currentSubscription?.plan?._id
                          ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                      disabled={plan._id === currentSubscription?.plan?._id || isSwitching !== null}
                    >
                      {isSwitching === plan._id 
                        ? 'Switching...'
                        : plan._id === currentSubscription?.plan?._id 
                          ? 'Current Plan' 
                          : 'Switch Plan'}
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
