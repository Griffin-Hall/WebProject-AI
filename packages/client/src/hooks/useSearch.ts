import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, SearchResponse } from '@voyage-matcher/shared';

export function useSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post<ApiResponse<SearchResponse>>('/api/search', { query });
      return res.data;
    },
  });
}
