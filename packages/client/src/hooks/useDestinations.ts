import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse, DestinationDetail, DestinationSummary } from '@voyage-matcher/shared';

interface UseDestinationsParams {
  page?: number;
  limit?: number;
  continent?: string;
  search?: string;
}

export function useDestinations(params: UseDestinationsParams = {}) {
  const { page = 1, limit = 20, continent, search } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (continent) queryParams.set('continent', continent);
  if (search) queryParams.set('search', search);

  return useQuery({
    queryKey: ['destinations', { page, limit, continent, search }],
    queryFn: () =>
      api.get<PaginatedResponse<DestinationSummary>>(
        `/api/destinations?${queryParams.toString()}`,
      ),
  });
}

export function useDestination(id: string) {
  return useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DestinationDetail }>(
        `/api/destinations/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });
}

export function useFeaturedDestinations() {
  return useQuery({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DestinationSummary[] }>(
        '/api/destinations/featured',
      );
      return res.data;
    },
  });
}
