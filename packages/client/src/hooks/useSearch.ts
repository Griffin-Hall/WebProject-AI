import { useMutation } from '@tanstack/react-query';
import type { ApiResponse, SearchResponse } from '@voyage-matcher/shared';
import { getAIHeaders } from '@/hooks/useAIConfig';

export function useSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const aiHeaders = getAIHeaders();

      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...aiHeaders,
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }

      const data: ApiResponse<SearchResponse> = await res.json();
      return data.data;
    },
  });
}
