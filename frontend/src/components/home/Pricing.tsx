import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscriptionService from '@/services/subscription.service';
import type { SubscriptionPlan } from '@/types';

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await SubscriptionService.getSubscriptionPlans();
        if (fetchedPlans && Array.isArray(fetchedPlans)) {
          const sortedPlans = fetchedPlans.sort((a, b) => {
            const order: { [key: string]: number } = { 'Free': 1, 'Essential': 2, 'Premium': 3 };
            return (order[a.name] || 99) - (order[b.name] || 99);
          });
          setPlans(sortedPlans);
        } else {
          setPlans([]);
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const renderPlan = (plan: SubscriptionPlan) => {
    const isPopular = plan.name === 'Essential';
    const buttonClass = isPopular
      ? 'bg-orange-500 hover:bg-orange-600 text-white'
      : 'bg-gray-200 hover:bg-gray-300';

    return (
      <div 
        key={plan.id}
        className={`bg-white rounded-lg shadow-lg overflow-hidden text-gray-800 ${isPopular ? 'relative transform scale-105 z-10' : ''}`}>
        {isPopular && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1">
            POPULAR
          </div>
        )}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold">₹{plan.price.monthly}</span>
            <span className="text-gray-500">{plan.name === 'Free' ? '/forever' : '/per month'}</span>
          </div>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link 
            href="/auth/signup" 
            className={`block w-full py-2 px-4 text-center rounded transition duration-300 ${buttonClass}`}>
            {plan.name === 'Free' ? 'Get Started' : 'Subscribe Now'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-orange-500 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
          <p className="text-lg">Choose the plan that works best for your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : plans.length > 0 ? (
            plans.map(renderPlan)
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-xl">No subscription plans available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
