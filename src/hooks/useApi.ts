import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';

type ApiError = {
  message: string;
};

interface UseApiResult<TData> {
  data: TData | undefined;
  error: ApiError | null;
  isLoading: boolean;
  refetch: () => void;
}

const useApi = <TData = unknown>(
  queryKey: unknown[],
  endpoint: string,
  options?: { enabled?: boolean }
): UseApiResult<TData> => {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError({ message: err.message || 'Unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData();
    }
  }, [endpoint, ...queryKey]);

  return { data, error, isLoading, refetch };
};

export default useApi;
