import api from './api';

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
    const response = await api.get('/api/settings/subscription');
    return response.data;
  },
  
  /**
   * Update subscription settings (admin only)
   * @param settings Updated subscription settings
   * @returns Updated settings
   */
  async updateSubscriptionSettings(settings: SubscriptionSettings) {
    const response = await api.put('/api/settings/subscription', settings);
    return response.data;
  },
  
  /**
   * Get site settings
   * @returns Site settings data
   */
  async getSiteSettings() {
    const response = await api.get('/api/settings/site');
    return response.data;
  },
  
  /**
   * Update site settings (admin only)
   * @param settings Updated site settings
   * @returns Updated settings
   */
  async updateSiteSettings(settings: SiteSettings) {
    const response = await api.put('/api/settings/site', settings);
    return response.data;
  },
  
  /**
   * Get all settings by type
   * @param type Settings type
   * @returns Settings data
   */
  async getSettingsByType(type: string) {
    const response = await api.get(`/api/settings/${type}`);
    return response.data;
  },
  
  /**
   * Update settings by type (admin only)
   * @param type Settings type
   * @param data Settings data
   * @returns Updated settings
   */
  async updateSettingsByType(type: string, data: any) {
    const response = await api.put(`/api/settings/${type}`, data);
    return response.data;
  }
};

export default SettingsService;
