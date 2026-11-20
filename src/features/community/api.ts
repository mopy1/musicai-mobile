import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  CommunityFeedResponse,
  CommunitySong,
  LikeToggleResponse,
} from '@/types/api';

export interface CommunityFeedParams {
  search?: string;
  page?: number;
}

export async function fetchTrending(): Promise<CommunitySong[]> {
  const data = await apiClient.get<CommunitySong[] | { results?: CommunitySong[] }>(
    ENDPOINTS.community.trending,
  );
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function fetchCommunityFeed(
  params: CommunityFeedParams = {},
): Promise<CommunityFeedResponse> {
  const query = new URLSearchParams();
  const cleanSearch = params.search?.trim();
  if (cleanSearch) query.set('search', cleanSearch);
  if (params.page && params.page > 1) query.set('page', String(params.page));

  const qs = query.toString();
  const path = qs ? `${ENDPOINTS.community.feed}?${qs}` : ENDPOINTS.community.feed;
  const data = await apiClient.get<CommunityFeedResponse>(path);

  return {
    results: data.results ?? [],
    count: data.count ?? 0,
    page: data.page ?? params.page ?? 1,
    has_next: Boolean(data.has_next),
  };
}

export async function toggleCommunityLike(songId: string): Promise<LikeToggleResponse> {
  return apiClient.post<LikeToggleResponse>(ENDPOINTS.community.like(songId));
}
