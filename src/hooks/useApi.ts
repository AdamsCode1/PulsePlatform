import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';

type ApiError = {
  message: string;
};

const useApi = <TData = unknown>(
  queryKey: unknown[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, ApiError, TData, unknown[]>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, ApiError> => {
  const queryFn = async (): Promise<TData> => {
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
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  };

  return useQuery<TData, ApiError, TData, unknown[]>({
    queryKey,
    queryFn,
    ...options,
  });
};

export default useApi;
