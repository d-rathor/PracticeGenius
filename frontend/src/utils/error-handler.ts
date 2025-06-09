import axios, { AxiosError } from 'axios';

/**
 * Interface for API error response
 */
interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Format error message from API response
 * @param error Axios error object
 * @returns Formatted error message
 */
export const getErrorMessage = (error: unknown): string => {
  // Default error message
  let message = 'An unexpected error occurred. Please try again.';
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Get error message from API response if available
    if (axiosError.response?.data) {
      const { data } = axiosError.response;
      
      if (data.message) {
        message = data.message;
      } else if (data.errors) {
        // Join all validation errors
        const errorMessages = Object.values(data.errors).flat();
        if (errorMessages.length > 0) {
          message = errorMessages.join('. ');
        }
      }
    } else if (axiosError.message) {
      // Network errors like CORS or timeout
      if (axiosError.message === 'Network Error') {
        message = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        message = axiosError.message;
      }
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  return message;
};

/**
 * Handle API errors and return appropriate message
 * @param error Error object
 * @returns Error message
 */
export const handleApiError = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  // Log error to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }
  
  return message;
};

/**
 * Check if error is an authentication error (401)
 * @param error Axios error object
 * @returns True if authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Check if error is a forbidden error (403)
 * @param error Axios error object
 * @returns True if forbidden error
 */
export const isForbiddenError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is a not found error (404)
 * @param error Axios error object
 * @returns True if not found error
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404;
  }
  return false;
};

/**
 * Check if error is a validation error (422)
 * @param error Axios error object
 * @returns True if validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 422;
  }
  return false;
};
