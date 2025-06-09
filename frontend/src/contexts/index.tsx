import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { SettingsProvider } from './SettingsContext';

/**
 * Combined provider component that wraps all context providers
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export { useAuthContext, withAuth } from './AuthContext';
export { useSubscription } from './SubscriptionContext';
export { useSettings } from './SettingsContext';
