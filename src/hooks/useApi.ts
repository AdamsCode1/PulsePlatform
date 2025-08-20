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

      const url = `${API_BASE_URL}/${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const contentType = response.headers.get('content-type') || '';
      // Debug log to help trace unexpected content types
      if (import.meta.env.DEV) {
        console.debug('[useApi] fetch', { url, status: response.status, ok: response.ok, contentType });
      }

      if (!response.ok) {
        // Try to parse JSON error, else fallback to text to avoid JSON parse crashes
        let message = `Request failed (${response.status})`;
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            message = errorData?.message || message;
          } else {
            const text = await response.text();
            message = text?.slice(0, 500) || message;
          }
        } catch (e) {
          // Swallow JSON parse errors; keep default message
        }
        throw new Error(message);
      }

      // Successful path: if server didn't return JSON, surface a clear, actionable error
      if (!contentType.includes('application/json')) {
        const text = await response.text().catch(() => '')
        const snippet = text?.slice(0, 300) || '';
        const looksLikeHTML = /<!doctype html|<html[\s>]/i.test(snippet);
        const hint = looksLikeHTML
          ? 'Received HTML instead of JSON. In development, ensure your API server is running (e.g., "vercel dev") and that the frontend dev server proxies /api to it.'
          : 'Response content-type was not JSON.';
        if (import.meta.env.DEV) {
          console.error('[useApi] Non-JSON success response', { url, contentType, snippet });
        }
        throw new Error(`Invalid JSON from server. ${hint}${snippet ? `\n\nPreview:\n${snippet}` : ''}`);
      }

      // Parse JSON normally
      let result: TData;
      try {
        result = await response.json();
      } catch (e: any) {
        // If parsing still fails despite JSON content-type, include snippet for debugging
        const text = await response.text().catch(() => '')
        const snippet = text?.slice(0, 300) || '';
        if (import.meta.env.DEV) {
          console.error('[useApi] JSON parse error', { url, contentType, snippet });
        }
        throw new Error(`Invalid JSON from server${snippet ? `: ${snippet}` : ''}`);
      }
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
