import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AIHealthStatus {
  status: 'available' | 'fallback' | 'error';
  primary: 'server-llm' | 'ollama' | 'keyword';
  provider?: string;
  model?: string;
  source?: string;
  message?: string;
}

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: async () => {
      try {
        return await api.get<AIHealthStatus>('/api/health/ai');
      } catch (error) {
        return {
          status: 'error' as const,
          primary: 'keyword' as const,
          provider: 'unknown',
          model: 'keyword-fallback',
          message: error instanceof Error ? error.message : 'Failed to check AI status',
        };
      }
    },
    refetchInterval: 30000,
    retry: false,
    staleTime: 10000,
  });
}

export function hasServerHostedAI(status: AIHealthStatus | undefined): boolean {
  return status?.status === 'available' && status.primary === 'server-llm';
}
