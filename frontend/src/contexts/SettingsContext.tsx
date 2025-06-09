import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsService } from '../services';
import { SubscriptionSettings, SiteSettings } from '../types';
import { useApi } from '../hooks';

// Settings context state
interface SettingsContextState {
  subscriptionSettings: SubscriptionSettings | null;
  siteSettings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSubscriptionSettings: (settings: SubscriptionSettings) => Promise<boolean>;
  updateSiteSettings: (settings: SiteSettings) => Promise<boolean>;
}

// Create context with default values
const SettingsContext = createContext<SettingsContextState>({
  subscriptionSettings: null,
  siteSettings: null,
  loading: false,
  error: null,
  refreshSettings: async () => {},
  updateSubscriptionSettings: async () => false,
  updateSiteSettings: async () => false,
});

/**
 * Settings context provider component
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  
  // Use custom hook for API calls
  const {
    loading,
    error,
    execute
  } = useApi();
  
  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Fetch all settings
  const fetchSettings = async () => {
    try {
      // Fetch subscription settings
      const subSettings = await execute(SettingsService.getSubscriptionSettings());
      if (subSettings) {
        setSubscriptionSettings(subSettings);
      }
      
      // Fetch site settings
      const siteConfig = await execute(SettingsService.getSiteSettings());
      if (siteConfig) {
        setSiteSettings(siteConfig);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  
  // Refresh all settings
  const refreshSettings = async () => {
    await fetchSettings();
  };
  
  // Update subscription settings
  const updateSubscriptionSettings = async (settings: SubscriptionSettings): Promise<boolean> => {
    try {
      const updated = await execute(SettingsService.updateSubscriptionSettings(settings));
      if (updated) {
        setSubscriptionSettings(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      return false;
    }
  };
  
  // Update site settings
  const updateSiteSettings = async (settings: SiteSettings): Promise<boolean> => {
    try {
      const updated = await execute(SettingsService.updateSiteSettings(settings));
      if (updated) {
        setSiteSettings(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating site settings:', error);
      return false;
    }
  };
  
  // Context value
  const value = {
    subscriptionSettings,
    siteSettings,
    loading,
    error,
    refreshSettings,
    updateSubscriptionSettings,
    updateSiteSettings,
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Custom hook to use settings context
 * @returns Settings context state
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
}

export default SettingsContext;
