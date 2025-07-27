// frontend/src/lib/api.ts

// Define a generic API response structure used across the app.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
}

/**
 * Base API client for making authenticated requests
 */
// Ensure the API URL is correctly formatted with the /api path.
// This handles cases where the env variable might be missing the path.
// Use relative path for development to leverage Next.js proxy, and absolute for production.
const baseUrl = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  : ''; // No base URL needed for dev proxy

const finalApiUrl = `${baseUrl}/api`;

const api = {
  BACKEND_API_URL: finalApiUrl,

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },

  /**
   * Make a PATCH request to the API
   */
  async patch<T>(endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
      ...options,
    });
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
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
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    let url = `${this.BACKEND_API_URL}${endpoint}`;

    // Handle query parameters
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
      // Do NOT delete options.params, as it's part of the passed options object
    }

    // Get the auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('practicegenius_token') : null;

    // Set up headers
    const requestHeaders = new Headers(options.headers || {});
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    let processedBody = options.body;
    // Set Content-Type for POST/PUT/PATCH if not already set and body is an object
    if (['POST', 'PUT', 'PATCH'].includes(options.method || '') && processedBody) {
      if (!(processedBody instanceof FormData) && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
        processedBody = JSON.stringify(processedBody);
      }
    }

    // Remove the custom 'params' from options before passing to fetch
    const { params, ...fetchOptions } = options;

    const finalOptions: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
      body: processedBody as BodyInit | undefined,
    };

    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || 'Request failed');
    }

    // Handle cases where the response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const responseText = await response.text();
    if (!responseText) {
      return {} as T;
    }

    return JSON.parse(responseText) as T;
  },
};

export default api;
