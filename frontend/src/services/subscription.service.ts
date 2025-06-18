import apiClient from '@/lib/api';
import { SubscriptionPlan } from '@/types/types'; // Import canonical type

// Local Subscription interface (if different from a global one, otherwise import too)
export interface Subscription {
  id: string;
  user: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  paymentMethod: string;
  paymentId?: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  planId: string;
  paymentMethod: string;
  paymentId?: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
}

/**
 * Subscription service for handling subscription-related API calls
 * Replaces localStorage usage with backend API calls
 */
const SubscriptionService = {
  /**
   * Get all subscription plans
   * @returns Array of subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> { // Uses imported SubscriptionPlan
    const response = await apiClient.get<{ success: boolean, data: SubscriptionPlan[] }>('/api/subscription-plans'); // apiClient.get will return data matching the backend structure, which aligns with canonical SubscriptionPlan
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    console.error('SubscriptionService: API response for plans was not in the expected format:', response);
    return []; // Return empty array if data extraction fails
  },
  
  /**
   * Get subscription plan by ID
   * @param id Subscription plan ID
   * @returns Subscription plan data
   */
  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null> {
    // Ensure the response structure from apiClient matches SubscriptionPlan or handle potential null/error cases
    try {
      const response = await apiClient.get<SubscriptionPlan>(`/api/subscription-plans/${id}`);
      // Assuming the API returns the plan directly or in a data property
      // Adjust based on actual API response structure if needed
      return response; // Or response.data if applicable
    } catch (error) {
      console.error(`Error fetching subscription plan by ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Get current user's active subscription
   * @returns User's active subscription or null
   */
  async getCurrentSubscription() {
    return apiClient.get<Subscription | null>('/api/subscriptions/current');
  },
  
  /**
   * Create a new subscription
   * @param subscriptionData Subscription data
   * @returns Created subscription
   */
  async createSubscription(subscriptionData: CreateSubscriptionData) {
    return apiClient.post<Subscription>('/api/subscriptions', subscriptionData);
  },
  
  /**
   * Cancel a subscription
   * @param id Subscription ID
   * @returns Updated subscription
   */
  async cancelSubscription(id: string) {
    return apiClient.put<Subscription>(`/api/subscriptions/${id}/cancel`, {});
  },
  
  /**
   * Renew a subscription
   * @param id Subscription ID
   * @returns Updated subscription
   */
  async renewSubscription(id: string) {
    return apiClient.put<Subscription>(`/api/subscriptions/${id}/renew`, {});
  },

  /**
   * Update a subscription plan
   * @param id The ID of the subscription plan to update
   * @param data The data to update the plan with (Partial<SubscriptionPlan>)
   * @returns The updated subscription plan
   */
  async updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      const response = await apiClient.put<SubscriptionPlan>(`/api/subscription-plans/${id}`, data);
      return response; // Or response.data if the API wraps it
    } catch (error) {
      console.error(`Error updating subscription plan ${id}:`, error);
      // Consider throwing the error or returning a more specific error object
      // for the UI to handle, e.g., for displaying toast notifications.
      return null;
    }
  },
  
  /**
   * Get recent subscriptions (admin only)
   * @param limit Number of subscriptions to return
   * @returns Array of recent subscriptions
   */
  async getRecentSubscriptions(limit: number = 5) {
    return apiClient.get<Subscription[]>(`/api/subscriptions/recent?limit=${limit}`);
  }
};

export default SubscriptionService;
