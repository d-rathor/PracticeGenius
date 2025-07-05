import React, { useEffect, useState, useCallback } from 'react';
import SubscriptionService from '@/services/subscription.service';
import EditPlanModal from '@/components/admin/EditPlanModal';
import { SubscriptionPlan } from '@/types';

import AdminLayout from '@/components/layout/AdminLayout';

const AdminSubscriptionsPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const fetchPlans = useCallback(async () => {
    console.log('Fetching plans for admin page...'); // Diagnostic log
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPlansData = await SubscriptionService.getSubscriptionPlans();
      console.log('Fetched plans data in AdminSubscriptionsPage:', JSON.stringify(fetchedPlansData, null, 2)); // DEBUG LINE
      setPlans(fetchedPlansData || []); // Ensure plans is always an array
    } catch (err: any) {
      console.error('Error fetching subscription plans:', err);
      setError(err.message || 'Failed to fetch subscription plans.');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies: setIsLoading, setError, setPlans are stable setters from useState

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-bold">
          Manage Subscription Plans
        </h1>
        <p className="mb-4">Here you can view and manage the subscription plans offered to users.</p>

        {isLoading && <p>Loading subscription plans...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && plans.length === 0 && (
          <p>No subscription plans found.</p>
        )}

        {!isLoading && !error && plans.length > 0 && (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan._id} className="p-4 border rounded-md shadow-sm">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="text-2xl font-bold text-indigo-600 mb-3">
                  {plan.currency || 'INR'} {plan.price} <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                </p>
                <p className="text-sm text-gray-500">Stripe Price IDs: Monthly: {plan.stripePriceId.monthly}, Yearly: {plan.stripePriceId.yearly}</p>
                <p className="text-sm text-gray-500">Stripe Product ID: {plan.stripeProductId}</p>
                <h3 className="mt-2 font-medium">Features:</h3>
                {plan.features && plan.features.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No features listed.</p>
                )}
                <button 
                  onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} 
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
        {/* TODO: Add 'Create New Plan' button here */}

      {editingPlan && (
        <EditPlanModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
          plan={editingPlan}
          onSave={async (updatedPlan) => {
            console.log('Saving plan:', updatedPlan);
            if (!updatedPlan._id) {
              console.error('Cannot save plan without an ID');
              setError('Failed to save plan: Missing ID.'); // Show error to user
              return;
            }
            const result = await SubscriptionService.updateSubscriptionPlan(updatedPlan._id, updatedPlan);
            if (result) {
              // Refresh plans list
              fetchPlans(); // Re-fetch to show updated data
              setIsModalOpen(false);
              setEditingPlan(null);
              // TODO: Add success toast/notification
            } else {
              // TODO: Add error toast/notification
              setError('Failed to update subscription plan. Please try again.');
            }
          }}
        />
      )}
      </div>
    </AdminLayout>
  );
};

import { withAuth } from '@/contexts/AuthContext';

export default withAuth(AdminSubscriptionsPage, true);
