import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SubscriptionService from '@/services/subscription.service';
import type { SubscriptionPlan } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const PricingPage: React.FC = () => {
    const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true);
        const plans = await SubscriptionService.getSubscriptionPlans();
        if (plans && Array.isArray(plans)) {
            // Sort plans: Free, Essential, Premium for consistent display
            const sortedPlans = plans.sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
                const order: { [key: string]: number } = { 'Free': 1, 'Essential': 2, 'Premium': 3 };
                return (order[a.name] || 99) - (order[b.name] || 99);
            });
            setSubscriptionPlans(sortedPlans);
        } else {
            console.error('Fetched plans are not in the expected format or are null:', plans);
            setSubscriptionPlans([]); // Set to empty array if no data or unexpected format
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        setSubscriptionPlans([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  const getPlanSpecificClasses = (planName: SubscriptionPlan['name']) => {
    if (planName === 'Essential') {
      return 'border-t-4 border-orange-500 relative';
    }
    return '';
  };

  const getPopularBadge = (planName: SubscriptionPlan['name']) => {
    if (planName === 'Essential') {
      return (
        <div className="absolute top-0 right-0 left-0 bg-orange-500 text-white text-center py-1 font-medium">
          Most Popular
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">Simple, Transparent </span>
              <span className="block text-orange-500">Pricing</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Choose the plan that works best for you and your child's educational needs. No hidden fees, cancel anytime.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : subscriptionPlans.length > 0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <div 
                  key={plan._id} 
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${getPlanSpecificClasses(plan.name)}`}
                >
                  {getPopularBadge(plan.name)}
                  <div className={`px-6 py-8 ${plan.name === 'Essential' ? 'mt-4' : ''}`}>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline text-gray-900">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ₹{plan.price}
                      </span>
                      <span className="ml-1 text-xl font-normal text-gray-500">
                        {plan.name === 'Free' ? '/forever' : '/per month'}
                      </span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500">{plan.description}</p>
                  </div>
                  <div className="px-6 pt-6 pb-8">
                    <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="ml-3 text-base text-gray-700">{feature}</p>
                        </li>
                      ))}
                    </ul>
                    {/* Buttons removed as per request */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-12">
              <p className="text-xl text-gray-500">No subscription plans available at the moment. Please check back later.</p>
            </div>
          )}

          <div className="mt-8 text-center text-gray-600">
            {user ? (
              <p>For managing your subscriptions, pls click on My Account--&gt;Subscription.</p>
            ) : (
              <p>
                Please{' '}
                <Link href="/auth/signup" className="text-orange-500 hover:underline font-medium">
                  register
                </Link>
                /
                <Link href="/auth/login" className="text-orange-500 hover:underline font-medium">
                  login
                </Link>{' '}
                to subscribe and upgrade your plans as per above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section (remains unchanged) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* FAQ Item 1 */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900">Can I switch between plans?</h3>
              <p className="mt-2 text-base text-gray-500">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.
              </p>
            </div>
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900">How do I cancel my subscription?</h3>
              <p className="mt-2 text-base text-gray-500">
                You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          </div>

          {/* FAQ Item 3 */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900">Do you offer refunds?</h3>
              <p className="mt-2 text-base text-gray-500">
                We offer a 7-day money-back guarantee if you're not satisfied with your subscription. Contact our support team within 7 days of your purchase to request a refund.
              </p>
            </div>
          </div>

          {/* FAQ Item 4 */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900">Do you offer discounts for schools?</h3>
              <p className="mt-2 text-base text-gray-500">
                Yes, we offer special pricing for schools and educational institutions. Please contact our sales team for more information about bulk licensing options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
