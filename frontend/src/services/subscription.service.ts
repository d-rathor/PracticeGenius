import apiClient, { ApiResponse } from '@/lib/api';
import { Subscription, SubscriptionPlan } from '@/types';

/**
 * Subscription service for handling subscription-related API calls.
 */
const SubscriptionService = {
  /**
   * Get all subscription plans.
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const result = await apiClient.get<any>('/subscription-plans');
      console.log('SubscriptionService: Received from API client:', result);

      // Case 1: Result is the array of plans itself.
      if (Array.isArray(result)) {
        console.log('SubscriptionService: Result is an array. Returning as is.');
        return result;
      }

      // Case 2: Result is an object like { success: true, data: [...] }.
      if (result && typeof result === 'object' && Array.isArray(result.data)) {
        console.log('SubscriptionService: Result is an object with a data property. Returning result.data.');
        return result.data;
      }
      
      // Fallback for unexpected structures.
      console.warn('SubscriptionService: Unexpected response structure for subscription plans. Returning empty array.', result);
      return [];

    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return []; // Return empty array on error to prevent UI crashes.
    }
  },

  /**
   * Get the current user's active subscription.
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<Subscription | null>>('/subscriptions/current');
      return response.data;
    } catch (error) {
      // A 404 is an expected case for users without a subscription, not a true error.
      if ((error as any)?.response?.status !== 404) {
        console.error('Error fetching current subscription:', error);
      }
      return null;
    }
  },

  /**
   * Create a Stripe checkout session for a new subscription.
   */
  async createCheckoutSession(planId: string): Promise<{ sessionId?: string; upgraded?: boolean }> {
    try {
      const response = await apiClient.post<ApiResponse<{ sessionId?: string; upgraded?: boolean }>>(
        '/subscriptions/create-checkout-session',
        { planId }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  /**
   * Verify a payment session after successful payment.
   */
  async verifyPaymentSession(sessionId: string): Promise<Subscription | null> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>('/subscriptions/verify-payment', { sessionId });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment session:', error);
      throw error;
    }
  },

  /**
   * Requests cancellation for the user's current active paid subscription.
   */
  async cancelPaidSubscription(): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>('/subscriptions/current');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  /**
   * Update a subscription plan (Admin only).
   */
  async updateSubscriptionPlan(planId: string, updatedPlan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.put<ApiResponse<SubscriptionPlan>>(`/subscription-plans/${planId}`, updatedPlan);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription plan ${planId}:`, error);
      throw error;
    }
  },
};

export default SubscriptionService;
