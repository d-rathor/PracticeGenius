import React from 'react';
import { SubscriptionPlan } from '@/types/types';
import { Subscription } from '@/services/subscription.service';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

const currencySymbols: { [key: string]: string } = {
  INR: '₹',
};

interface PlanGridProps {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  showActions: boolean;
  onSwitchPlan?: (planId: string) => void;
  isSwitching?: string | null;
}

const PlanGrid: React.FC<PlanGridProps> = ({
  plans,
  currentSubscription,
  showActions,
  onSwitchPlan,
  isSwitching,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan._id} className={`relative flex flex-col ${plan.name === 'Premium' ? 'border-2 border-orange-500' : ''}`}>
          {plan.name === 'Premium' && (
            <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-bl">
              Popular
            </div>
          )}
          <CardHeader>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold">{currencySymbols[plan.currency || 'INR'] || '₹'}{plan.price.monthly}</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
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
          {showActions && (
            <CardFooter>
              <button
                onClick={() => onSwitchPlan && onSwitchPlan(plan._id)}
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
          )}
        </Card>
      ))}
    </div>
  );
};

export default PlanGrid;
