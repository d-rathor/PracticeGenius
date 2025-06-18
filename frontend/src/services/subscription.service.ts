import apiClient from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Essential' | 'Premium';
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  downloadLimit: number;
  isActive: boolean;
}

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
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<{ success: boolean, data: SubscriptionPlan[] }>('/api/subscription-plans');
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
  async getSubscriptionPlanById(id: string) {
    return apiClient.get<SubscriptionPlan>(`/api/subscription-plans/${id}`);
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
   * Get recent subscriptions (admin only)
   * @param limit Number of subscriptions to return
   * @returns Array of recent subscriptions
   */
  async getRecentSubscriptions(limit: number = 5) {
    return apiClient.get<Subscription[]>(`/api/subscriptions/recent?limit=${limit}`);
  }
};

export default SubscriptionService;
