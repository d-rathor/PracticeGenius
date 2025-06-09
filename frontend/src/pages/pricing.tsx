import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/contexts/AuthContext';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const PricingPage: React.FC = () => {
  const router = useRouter();
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const { isAuthenticated } = useAuthContext();

  // Authentication state is now handled by useAuthContext

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        
        // Use mock data directly in development to avoid API call errors
        if (process.env.NODE_ENV === 'development') {
          const mockPricingPlans = [
            {
              id: 'basic',
              name: 'Basic',
              price: isAnnual ? 9.99 : 12.99,
              interval: isAnnual ? 'month' : 'month',
              description: 'Perfect for individual students or parents',
              features: [
                'Access to 100+ basic worksheets',
                'Download up to 10 worksheets per month',
                'Basic progress tracking',
                'Email support'
              ]
            },
            {
              id: 'premium',
              name: 'Premium',
              price: isAnnual ? 19.99 : 24.99,
              interval: isAnnual ? 'month' : 'month',
              description: 'Great for families and homeschooling',
              features: [
                'Access to 500+ premium worksheets',
                'Unlimited downloads',
                'Advanced progress tracking',
                'Priority email support',
                'Customizable worksheets',
                'Up to 3 student profiles'
              ],
              isPopular: true
            },
            {
              id: 'pro',
              name: 'Professional',
              price: isAnnual ? 49.99 : 59.99,
              interval: isAnnual ? 'month' : 'month',
              description: 'Ideal for teachers and educational institutions',
              features: [
                'Access to all 1,000+ worksheets',
                'Unlimited downloads',
                'Comprehensive progress tracking',
                'Priority phone and email support',
                'Customizable worksheets',
                'Unlimited student profiles',
                'Bulk worksheet generation',
                'Advanced analytics'
              ]
            }
          ];
          setPricingPlans(mockPricingPlans);
          setIsLoading(false);
          return;
        }
        
        // Only try the API call if not in development
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/subscription-plans`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPricingPlans(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPricingPlans();
  }, [isAnnual]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push(`/auth/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }

    try {
      // In a real app, this would create a subscription
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          interval: isAnnual ? 'annual' : 'monthly',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Redirect to dashboard after successful subscription
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again later.');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your educational needs. All plans include access to our growing library of high-quality worksheets.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual Billing
              <span className="ml-1 text-xs text-green-500 font-medium">Save 20%</span>
            </span>
            <button
              className="relative mx-4 inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={!isAnnual}
            >
              <span className="sr-only">Toggle billing period</span>
              <span
                className={`${
                  isAnnual ? 'translate-x-1' : 'translate-x-6'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
              />
            </button>
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly Billing
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.isPopular ? 'border-orange-500 shadow-lg' : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                    <Badge className="bg-orange-500 text-white mx-auto">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-500 mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.interval}</span>
                    {isAnnual && (
                      <div className="text-sm text-green-500 font-medium mt-1">
                        Billed annually
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      plan.isPopular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {isAuthenticated ? 'Subscribe Now' : 'Sign Up'}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. If you cancel, you'll still have access until the end of your billing period.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How many worksheets can I download?</h3>
              <p className="text-gray-600">The Basic plan allows up to 10 downloads per month, while Premium and Professional plans offer unlimited downloads.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">Yes, you can change your subscription plan at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the change will take effect at the end of your current billing cycle.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, contact our support team within 30 days of your purchase for a full refund.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our payment provider.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-orange-50 rounded-lg p-8 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
            >
              Contact Support
            </Link>
            <Link 
              href="/worksheets" 
              className="inline-flex items-center px-6 py-3 border border-orange-500 text-base font-medium rounded-md text-orange-500 bg-white hover:bg-orange-50 focus:outline-none"
            >
              Browse Worksheets
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
