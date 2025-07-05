import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

// Layout types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'suspended';
  activeSubscription?: Subscription;
  downloadHistory?: DownloadHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DownloadHistoryItem {
  worksheet: string | Worksheet;
  downloadedAt: string;
}

// Worksheet types
export interface Worksheet {
  _id: string; 
  id: string; 
  title: string;
  description: string;
  subject: string;
  grade: string;
  subscriptionLevel: 'Free' | 'Essential' | 'Premium';
  keywords: string[];
  fileUrl: string;
  thumbnailUrl: string;
  createdBy: string | User;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorksheetFilters {
  subject?: string;
  grade?: string;
  subscriptionLevel?: 'Free' | 'Essential' | 'Premium';
  search?: string;
  page?: number;
  limit?: number;
}

// Subscription types
export interface SubscriptionPlan {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  downloadLimit: number;
  isActive: boolean;
  stripeProductId?: string;
}

export interface Subscription {
  _id: string;
  id: string;
  user: string | User;
  plan: SubscriptionPlan | string;
  status: 'active' | 'canceled' | 'expired' | 'incomplete' | 'past_due' | 'pending_cancellation';
  startDate: string;
  currentPeriodEnd: string;
  cancellation_effective_date?: number;
  paymentMethod: string;
  paymentId?: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// Settings types
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

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string | null;
  user?: User | null;
  requiresVerification?: boolean;
}
