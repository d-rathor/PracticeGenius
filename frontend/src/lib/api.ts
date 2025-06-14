console.log('--- lib/api.ts VERSION_CHECK_ABC789 ---');
// Custom API client for PracticeGenius

const NODE_ENV_VALUE = process.env.NODE_ENV;

/**
 * Base API client for making authenticated requests
 */
const apiClient = {
  isDevelopmentCheck: NODE_ENV_VALUE === 'development',
  API_BASE_URL: 'http://localhost:8080', // Temporarily forced
  BACKEND_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',

  logInitialDebug: function() {
    console.log('[api.ts] DEBUG: process.env.NODE_ENV:', NODE_ENV_VALUE);
    console.log('[api.ts] DEBUG: isDevelopmentCheck (NODE_ENV === "development"):', this.isDevelopmentCheck);
    console.log('[api.ts] DEBUG: Forced API_BASE_URL for this session to:', this.API_BASE_URL);
  },

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },

  /**
   * Make a PATCH request to the API
   */
  async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { // Changed to use this.request for consistency
      method: 'PATCH',
      body: data,
      ...options,
    });
  },

  /**
   * Make a DELETE request to the API
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
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
    const endpointPath = `/${cleanEndpoint}`;

    // Construct the URL using the (currently forced) API_BASE_URL for this debugging session
    const url = `${this.API_BASE_URL}${endpointPath}`;
    console.log(`[api.ts] DEBUG: Making ${options.method || 'GET'} request to (using forced API_BASE_URL): ${url}`);

    // Log what the URL would have been with the original, non-forced logic for context
    const originalCalculatedBase = this.isDevelopmentCheck 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') 
      : '/api/proxy'; // In a non-debug scenario, production might use a relative path for a Next.js proxy
    console.log(`[api.ts] DEBUG: Original URL (if not forced) would have been: ${originalCalculatedBase}${endpointPath}`);
    
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('practicegenius_token') || ''; 
    }

    const requestHeaders = new Headers(options.headers);

    if (!this.isDevelopmentCheck) {
      requestHeaders.set('X-Forwarded-For', 'frontend');
    }

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    let processedBody = options.body;

    console.log('[api.ts] Token retrieved from localStorage:', token);

    if (options.body instanceof FormData) {
      requestHeaders.delete('Content-Type');
    } 
    else if (options.body && typeof options.body === 'object' && 
             !(options.body instanceof ArrayBuffer) && 
             !(options.body instanceof Blob) && 
             !(options.body instanceof URLSearchParams)) {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      if (requestHeaders.get('Content-Type')?.includes('application/json')) {
        processedBody = JSON.stringify(options.body);
      }
    }

    console.log('[api.ts] Request Headers before fetch:', Object.fromEntries(requestHeaders.entries()));
    console.log('[api.ts] Processed Body type before fetch:', processedBody instanceof FormData ? 'FormData' : typeof processedBody);

    try {
      const response = await fetch(url, {
        ...options, 
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
      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        return responseText as any as T; 
      }

    } catch (error: any) {
      console.error(
        'API Error in request method:', 
        error.data || error.message, 
        error.status ? `Status: ${error.status}`: '', 
        'URL:', url, 
        'Options:', {...options, headers: Object.fromEntries(requestHeaders.entries()), body: 'omitted for brevity if FormData or large'}
      );
      throw error; 
      throw error;
    }
  },
};

// Call the debug log function once when the module loads and api object is defined.
apiClient.logInitialDebug();

export default apiClient;
