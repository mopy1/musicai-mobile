import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  GenerationJob,
  LibrarySong,
  SongDetail,
  SongGeneratePayload,
  SongGenerateResponse,
  UrlResponse,
} from '@/types/api';

type ListResponse<T> = T[] | { results?: T[] };

function unwrapList<T>(data: ListResponse<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchLibrarySongs(): Promise<LibrarySong[]> {
  const data = await apiClient.get<ListResponse<LibrarySong>>(ENDPOINTS.songs.library);
  return unwrapList(data);
}

export async function fetchSongDetail(id: string): Promise<SongDetail> {
  return apiClient.get<SongDetail>(ENDPOINTS.songs.detail(id));
}

export async function updateSong(
  id: string,
  payload: { title?: string; is_public?: boolean },
): Promise<SongDetail> {
  return apiClient.patch<SongDetail>(ENDPOINTS.songs.detail(id), payload);
}

export async function getSongPlayUrl(id: string): Promise<string> {
  const res = await apiClient.get<UrlResponse>(ENDPOINTS.songs.playUrl(id));
  return res.url;
}

export async function getSongThumbnailUrl(id: string): Promise<string | null> {
  try {
    const res = await apiClient.get<UrlResponse>(ENDPOINTS.songs.thumbnailUrl(id));
    return res.url || null;
  } catch {
    return null;
  }
}

export async function generateSong(
  payload: SongGeneratePayload,
): Promise<SongGenerateResponse> {
  return apiClient.post<SongGenerateResponse>(ENDPOINTS.songs.generate, payload);
}

export async function fetchActiveSongJobs(): Promise<GenerationJob[]> {
  const data = await apiClient.get<ListResponse<GenerationJob>>(
    `${ENDPOINTS.songs.jobs}?active=1`,
  );
  return unwrapList(data);
}
