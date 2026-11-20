import { create } from 'zustand';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { UrlResponse } from '@/types/api';

export interface PlayerTrack {
  id: string;
  title: string;
  artist?: string | null;
  thumbnailUrl?: string | null;
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  audioUrl: string | null;
  isLoading: boolean;
  error: string | null;
  playSong: (track: PlayerTrack) => Promise<void>;
  clear: () => void;
}

let activeRequestId = 0;

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  audioUrl: null,
  isLoading: false,
  error: null,

  playSong: async (track) => {
    const requestId = ++activeRequestId;
    set({
      currentTrack: track,
      audioUrl: null,
      isLoading: true,
      error: null,
    });

    try {
      const response = await apiClient.get<UrlResponse>(ENDPOINTS.songs.playUrl(track.id));
      if (requestId !== activeRequestId) return;

      set({
        audioUrl: response.url,
        isLoading: false,
        error: null,
      });

      // Registra la reproducción en segundo plano sin bloquear la reproducción local.
      void apiClient
        .post(ENDPOINTS.community.play(track.id), { duration_seconds: 0 })
        .catch(() => undefined);
    } catch (err) {
      if (requestId !== activeRequestId) return;
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar el audio de la canción.';
      set({
        audioUrl: null,
        isLoading: false,
        error: message,
      });
    }
  },

  clear: () => {
    activeRequestId += 1;
    set({
      currentTrack: null,
      audioUrl: null,
      isLoading: false,
      error: null,
    });
  },
}));
