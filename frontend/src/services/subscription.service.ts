import api from './api';

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
  async getSubscriptionPlans() {
    const response = await api.get('/api/subscription-plans');
    return response.data;
  },
  
  /**
   * Get subscription plan by ID
   * @param id Subscription plan ID
   * @returns Subscription plan data
   */
  async getSubscriptionPlanById(id: string) {
    const response = await api.get(`/api/subscription-plans/${id}`);
    return response.data;
  },
  
  /**
   * Get current user's active subscription
   * @returns User's active subscription or null
   */
  async getCurrentSubscription() {
    const response = await api.get('/api/subscriptions/current');
    return response.data;
  },
  
  /**
   * Create a new subscription
   * @param subscriptionData Subscription data
   * @returns Created subscription
   */
  async createSubscription(subscriptionData: CreateSubscriptionData) {
    const response = await api.post('/api/subscriptions', subscriptionData);
    return response.data;
  },
  
  /**
   * Cancel a subscription
   * @param id Subscription ID
   * @returns Updated subscription
   */
  async cancelSubscription(id: string) {
    const response = await api.put(`/api/subscriptions/${id}/cancel`);
    return response.data;
  },
  
  /**
   * Renew a subscription
   * @param id Subscription ID
   * @returns Updated subscription
   */
  async renewSubscription(id: string) {
    const response = await api.put(`/api/subscriptions/${id}/renew`);
    return response.data;
  },
  
  /**
   * Get recent subscriptions (admin only)
   * @param limit Number of subscriptions to return
   * @returns Array of recent subscriptions
   */
  async getRecentSubscriptions(limit: number = 5) {
    const response = await api.get('/api/subscriptions/recent', { params: { limit } });
    return response.data;
  }
};

export default SubscriptionService;
