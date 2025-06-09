import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/error-handler';

/**
 * Custom hook for handling API requests with loading and error states
 * @template T The type of data returned by the API
 * @param initialData Initial data value
 * @returns Object with data, loading state, error state, and execute function
 */
export function useApi<T>(initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute an API request
   * @param apiPromise Promise returned by API call
   * @param onSuccess Optional callback to run on success
   * @returns Result of the API call
   */
  const execute = useCallback(async <R>(
    apiPromise: Promise<R>,
    onSuccess?: (result: R) => void
  ): Promise<R | undefined> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiPromise;
      
      setData(result as unknown as T);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData
  };
}

export default useApi;
