// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
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
  user: string | User;
  plan: string | SubscriptionPlan;
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
  token: string;
  user: User;
}
