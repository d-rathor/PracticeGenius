import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface PricePlan {
  essentialPrice: number;
  premiumPrice: number;
}

const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState<PricePlan>({
    essentialPrice: 500,
    premiumPrice: 1000
  });
  
  useEffect(() => {
    // Fetch pricing data from API
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        // Determine if we're in development or production
        const isDev = process.env.NODE_ENV === 'development';
        
        // Use direct URLs for both environments
        const apiUrl = isDev 
          ? 'http://localhost:8080/api/pricing' 
          : 'https://practicegenius-api.onrender.com/api/pricing';
        
        console.log('Fetching pricing from:', apiUrl, 'Environment:', process.env.NODE_ENV);
        
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            if (data && typeof data === 'object') {
              setPrices({
                essentialPrice: data.essentialPrice || 500,
                premiumPrice: data.premiumPrice || 1000
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch pricing:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrices();
  }, []);

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

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                  <span className="ml-1 text-xl font-normal text-gray-500">/forever</span>
                </div>
                <p className="mt-5 text-lg text-gray-500">Basic access to limited worksheets</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Access to 2 worksheets per grade and subject</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Preview all worksheets</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Basic support</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">No credit card required</p>
                  </li>
                </ul>
                <h4 className="mt-8 text-sm font-medium text-gray-900">Limitations:</h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Limited worksheet access</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">No new worksheet updates</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Basic support only</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    className="w-full bg-white border border-orange-500 rounded-md py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50"
                  >
                    Included
                  </button>
                </div>
              </div>
            </div>

            {/* Essential Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-orange-500 relative">
              <div className="absolute top-0 right-0 left-0 bg-orange-500 text-white text-center py-1 font-medium">
                Most Popular
              </div>
              <div className="px-6 py-8 mt-4">
                <h3 className="text-2xl font-bold text-gray-900">Essential</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">₹{prices.essentialPrice}</span>
                  <span className="ml-1 text-xl font-normal text-gray-500">/per month</span>
                </div>
                <p className="mt-5 text-lg text-gray-500">Perfect for regular learning needs</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Access to all Essential worksheets (Grades 1-5)</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Unlimited downloads</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Monthly new worksheets</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Email support</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">7-day free trial</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Cancel anytime</p>
                  </li>
                </ul>
                <h4 className="mt-8 text-sm font-medium text-gray-900">Limitations:</h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">No access to Premium worksheets</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Standard support response time</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    className="w-full bg-orange-500 border border-transparent rounded-md py-2 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Included
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">₹{prices.premiumPrice}</span>
                  <span className="ml-1 text-xl font-normal text-gray-500">/per month</span>
                </div>
                <p className="mt-5 text-lg text-gray-500">Complete access to all resources</p>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Access to ALL worksheets (Grades 1-5)</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Unlimited downloads</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Priority access to new worksheets</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Premium support</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">7-day free trial</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">Cancel anytime</p>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    className="w-full bg-white border border-orange-500 rounded-md py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50"
                  >
                    Current Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
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
