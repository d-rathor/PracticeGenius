import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  isPopular?: boolean;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
}

const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      setPlans([
        {
          id: 'basic',
          name: 'Basic',
          price: 4.99,
          interval: 'month',
          features: [
            'Access to 50 worksheets',
            '10 downloads per month',
            'Basic worksheet customization'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          interval: 'month',
          features: [
            'Access to 200 worksheets',
            '50 downloads per month',
            'Advanced worksheet customization',
            'Priority support'
          ],
          isPopular: true
        },
        {
          id: 'pro',
          name: 'Professional',
          price: 19.99,
          interval: 'month',
          features: [
            'Unlimited access to all worksheets',
            'Unlimited downloads',
            'Full worksheet customization',
            'Priority support',
            'Bulk download options'
          ]
        }
      ]);

      setSubscription({
        id: 'sub_123456',
        planId: 'premium',
        status: 'active',
        startDate: '2025-05-01',
        endDate: '2025-07-01',
        autoRenew: true,
        paymentMethod: 'Visa ending in 4242'
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.id === subscription.planId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Current Subscription</h2>
                  <Badge variant={subscription?.status === 'active' ? 'success' : 'warning'}>
                    {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium">{getCurrentPlan()?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${getCurrentPlan()?.price} / {getCurrentPlan()?.interval}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(subscription?.startDate || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Renewal Date</p>
                    <p className="font-medium">{formatDate(subscription?.endDate || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Auto-Renew</p>
                    <p className="font-medium">{subscription?.autoRenew ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{subscription?.paymentMethod}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-4">
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                    Update Payment Method
                  </button>
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                    {subscription?.autoRenew ? 'Cancel Auto-Renew' : 'Enable Auto-Renew'}
                  </button>
                </div>
              </CardFooter>
            </Card>

            {/* Available Plans */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-2 border-orange-500' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-bl">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <button 
                      className={`w-full py-2 px-4 rounded text-center font-medium ${
                        plan.id === subscription?.planId
                          ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white transition duration-300'
                      }`}
                      disabled={plan.id === subscription?.planId}
                    >
                      {plan.id === subscription?.planId ? 'Current Plan' : 'Switch Plan'}
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Billing History */}
            <Card className="mt-8">
              <CardHeader>
                <h2 className="text-xl font-semibold">Billing History</h2>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 1, 2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Premium Plan Subscription
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $9.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="success">Paid</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 1, 2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Premium Plan Subscription
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $9.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="success">Paid</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
