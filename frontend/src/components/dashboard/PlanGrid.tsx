import React from 'react';
import { SubscriptionPlan } from '@/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const currencySymbols: { [key: string]: string } = {
  INR: '₹',
};

interface PlanGridProps {
  plans: SubscriptionPlan[];
  currentPlanId: string | undefined | null;
  showActions: boolean;
  onSwitchPlan: (planId: string) => void;
  isSwitching: boolean;
}

const PlanGrid: React.FC<PlanGridProps> = ({
  plans,
  currentPlanId,
  showActions,
  onSwitchPlan,
  isSwitching,
}) => {
  const currentPlanDetails = plans.find((p) => p._id === currentPlanId);
  const isPaidPlanActive = !!currentPlanDetails && currentPlanDetails.price > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = plan._id === currentPlanId;
        const isThisPlanFree = plan.price === 0;
        const shouldHideButton = isPaidPlanActive && isThisPlanFree;

        return (
          <Card
            key={plan._id}
            className={`relative flex flex-col ${
              plan.name === 'Premium' ? 'border-2 border-orange-500' : ''
            }`}
          >
            {plan.name === 'Premium' && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-bl">
                Popular
              </div>
            )}
            <CardHeader>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold">
                  {currencySymbols[plan.currency || 'INR'] || '₹'}
                  {plan.price}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            {showActions && !shouldHideButton && (
              <CardFooter>
                <Button
                  onClick={() => onSwitchPlan(plan._id)}
                  className={`w-full py-2 px-4 rounded text-center font-medium transition duration-300 ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={isCurrentPlan || isSwitching}
                >
                  {isSwitching && !isCurrentPlan
                    ? 'Processing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : 'Switch Plan'}
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PlanGrid;
