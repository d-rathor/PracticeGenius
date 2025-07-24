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
        endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    // Construct the URL
    // In development, BACKEND_API_URL is '/api', so the URL is relative (e.g., /api/worksheets)
    // In production, it's the full absolute URL.
    const base = this.BACKEND_API_URL;
    // Ensure the endpoint path doesn't start with a slash if the base already has one
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    let url = `${base}/${path}`;

    // --- CACHE BUSTING IMPLEMENTATION ---
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}cb=${Date.now()}`;

    console.log(`[api.ts] DEBUG: Making ${options.method || 'GET'} request to: ${url}`);

    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('practicegenius_token') || '';
    }

    const requestHeaders = new Headers(options.headers);

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    let processedBody = options.body;

    if (options.body instanceof FormData) {
      // Let browser set Content-Type for FormData
      requestHeaders.delete('Content-Type');
    } else if (options.body && typeof options.body === 'object') {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      if (requestHeaders.get('Content-Type')?.includes('application/json')) {
        processedBody = JSON.stringify(options.body);
      }
    }

    // Destructure body and headers from options to avoid conflicts.
    // This is the key fix to prevent hanging requests.
    const { body, headers, params, ...restOfOptions } = options;

    try {
      const response = await fetch(url, {
        ...restOfOptions,
        headers: requestHeaders,
        body: processedBody,
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: `Failed to parse JSON error response. Status: ${response.status}` };
          }
        } else {
          try {
            errorData = { message: await response.text() };
          } catch (e) {
            errorData = { message: `Failed to read error response text. Status: ${response.status}` };
          }
        }

        const error = new Error(errorData.message || `API request failed with status ${response.status}`) as any;
        error.response = response;
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const responseText = await response.text();
      if (!responseText) {
        return null as T; // Handle empty responses gracefully
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        // If response is not JSON, return as text
        return responseText as any as T;
      }
    } catch (error: any) {
      console.error(
        'API Error in request method:',
        error.data || error.message,
        error.status ? `Status: ${error.status}` : '',
        'URL:',
        url
      );
      throw error;
    }
  },
};

export default api;
