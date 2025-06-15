import apiClient from '@/lib/api';

export interface SubscriptionSettings {
  plans: Array<{
    name: 'Free' | 'Essential' | 'Premium';
    price: {
      monthly: number;
      yearly: number;
    };
    features: string[];
  }>;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  footerText: string;
}

/**
 * Settings service for handling application settings
 * Replaces localStorage usage with backend API calls
 */
const SettingsService = {
  /**
   * Get subscription settings
   * @returns Subscription settings data
   */
  async getSubscriptionSettings() {
    return apiClient.get<SubscriptionSettings>('/api/settings/subscription');
  },
  
  /**
   * Update subscription settings (admin only)
   * @param settings Updated subscription settings
   * @returns Updated settings
   */
  async updateSubscriptionSettings(settings: SubscriptionSettings) {
    return apiClient.put<SubscriptionSettings>('/api/settings/subscription', settings);
  },
  
  /**
   * Get site settings
   * @returns Site settings data
   */
  async getSiteSettings() {
    return apiClient.get<SiteSettings>('/api/settings/site');
  },
  
  /**
   * Update site settings (admin only)
   * @param settings Updated site settings
   * @returns Updated settings
   */
  async updateSiteSettings(settings: SiteSettings) {
    return apiClient.put<SiteSettings>('/api/settings/site', settings);
  },
  
  /**
   * Get all settings by type
   * @param type Settings type
   * @returns Settings data
   */
  async getSettingsByType(type: string) {
    return apiClient.get<any>(`/api/settings/${type}`);
  },
  
  /**
   * Update settings by type (admin only)
   * @param type Settings type
   * @param data Settings data
   * @returns Updated settings
   */
  async updateSettingsByType(type: string, data: any) {
    return apiClient.put<any>(`/api/settings/${type}`, data);
  }
};

export default SettingsService;
