import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { SubscriptionService } from '../services';
import { Subscription, SubscriptionPlan } from '../types';
import { useApi } from '../hooks';

// Subscription context state
interface SubscriptionContextState {
  currentSubscription: Subscription | null;
  subscriptionPlans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionContextState>({
  currentSubscription: null,
  subscriptionPlans: [],
  loading: false,
  error: null,
  refreshSubscription: async () => {},
});

/**
 * Subscription context provider component
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  
  // Use custom hook for API calls
  const {
    data: currentSubscription,
    loading,
    error,
    execute
  } = useApi<Subscription | null>(null);
  
  // Fetch subscription data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptionData();
    }
  }, [isAuthenticated, user]);
  
  // Fetch subscription data
  const fetchSubscriptionData = async () => {
    try {
      // Fetch current subscription
      execute(SubscriptionService.getCurrentSubscription());
      
      // Fetch subscription plans
      const plans = await SubscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };
  
  // Refresh subscription data
  const refreshSubscription = async () => {
    if (isAuthenticated) {
      await fetchSubscriptionData();
    }
  };
  
  // Context value
  const value = {
    currentSubscription: currentSubscription ?? null, // Ensure it's always Subscription | null (not undefined)
    subscriptionPlans,
    loading,
    error,
    refreshSubscription
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Custom hook to use subscription context
 * @returns Subscription context state
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
}

export default SubscriptionContext;
