import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Subscription, SubscriptionPlan } from '@/types';
import SubscriptionService from '@/services/subscription.service';
import { useAuthContext } from '@/contexts/AuthContext';

interface SubscriptionContextState {
  currentSubscription: Subscription | null;
  subscriptionPlans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  verifyPaymentSession: (sessionId: string) => Promise<Subscription | null>;
  cancelActiveSubscription: () => Promise<void>;
  refetchSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextState | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentSubscription(null);
      setSubscriptionPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const plans = await SubscriptionService.getSubscriptionPlans();
      const subscription = await SubscriptionService.getCurrentSubscription();

      if (Array.isArray(plans)) {
        setSubscriptionPlans(plans);
      } else {
        console.error('SubscriptionContext Error: Data received for subscription plans is not an array. See previous log from service for details. Setting empty array to prevent crash.', plans);
        setSubscriptionPlans([]);
      }
      
      setCurrentSubscription(subscription);
    } catch (err: any) {
      console.error('Failed to fetch subscription data:', err);
      setError(err.message || 'An error occurred while fetching subscription data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const verifyPaymentSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      setError(null);
      try {
        const subscription = await SubscriptionService.verifyPaymentSession(sessionId);
        if (subscription) {
          setCurrentSubscription(subscription);
        }
        return subscription;
      } catch (err: any) {
        console.error('Payment verification failed:', err);
        setError(err.message || 'An error occurred during payment verification.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelActiveSubscription = useCallback(async () => {
    if (!currentSubscription) {
      toast.error('No active subscription to cancel.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await SubscriptionService.cancelPaidSubscription();
      toast.success('Your subscription will be canceled at the end of the current billing period.');
      // Refetch data to get the updated subscription status
      await fetchSubscriptionData();
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      const errorMessage = (err as any)?.response?.data?.error || 'An error occurred while canceling the subscription.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentSubscription, fetchSubscriptionData]);


  const value = {
    currentSubscription,
    subscriptionPlans,
    loading,
    error,
    verifyPaymentSession,
    cancelActiveSubscription,
    refetchSubscription: fetchSubscriptionData,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = (): SubscriptionContextState => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
