// src/types.ts (or a similar path)
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  status?: string | null;
  activeSubscription?: string | null;
  createdAt?: string | null;
  // Add other user-specific fields as necessary
}

export interface SubscriptionPlan {
  _id: string; // From MongoDB, used by services
  id: string;  // Often a mapped version of _id or primary key, expected by context
  name: string; // Kept as string for flexibility from admin page
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  downloadLimit: number;
  isActive: boolean;
  currency?: string;         // From our admin page work, optional
  stripePriceId?: string;    // From original types.ts version, optional
  stripeProductId?: string;  // From original types.ts version, optional
}