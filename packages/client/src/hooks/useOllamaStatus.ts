import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface OllamaStatus {
  status: 'available' | 'unavailable' | 'error';
  model?: string;
  baseUrl?: string;
  message?: string;
  fallback?: string;
}

/**
 * Hook to check Ollama (local LLM) connection status
 * 
 * Usage:
 * const { data, isLoading } = useOllamaStatus();
 * 
 * if (data?.status === 'available') {
 *   // Ollama is running locally
 * }
 */
export function useOllamaStatus() {
  return useQuery({
    queryKey: ['ollama', 'status'],
    queryFn: async () => {
      try {
        const response = await api.get<OllamaStatus>('/api/health/ollama');
        return response;
      } catch (error) {
        // If we get a 503, Ollama is configured but not running
        if (error instanceof Error && error.message.includes('503')) {
          return {
            status: 'unavailable' as const,
            message: 'Ollama is not running',
            fallback: 'Using keyword-based extraction',
          };
        }
        return {
          status: 'error' as const,
          message: error instanceof Error ? error.message : 'Failed to check Ollama status',
        };
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
    staleTime: 10000,
  });
}
