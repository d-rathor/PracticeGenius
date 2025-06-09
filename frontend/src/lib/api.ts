// Custom API client for PracticeGenius

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Base API client for making authenticated requests
 */
export const api = {
  /**
   * Make a GET request to the API
   * @param endpoint API endpoint
   * @param options Additional fetch options
   * @returns Response data
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  /**
   * Make a POST request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Response data
   */
  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  },

  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Response data
   */
  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  },

  /**
   * Make a PATCH request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Response data
   */
  async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint
   * @param options Additional fetch options
   * @returns Response data
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  },

  /**
   * Make a request to the API with authentication
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Response data
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    // Get the token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;
    
    // Set up headers with authentication
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle authentication errors
      if (response.status === 401) {
        // If we're in the browser, we can redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
        }
      }
      
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        data: errorData,
      };
    }
    
    // Parse JSON response or return empty object if no content
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  },
};

export default api;
