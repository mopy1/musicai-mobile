import { create } from 'zustand';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type { AppNotification, NotificationsResponse } from '@/types/api';

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.get<NotificationsResponse>(ENDPOINTS.notifications.list);
      set({
        items: data.results ?? [],
        unreadCount: data.unread_count ?? 0,
        loading: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones.';
      set({ loading: false, error: message });
    }
  },

  markRead: async (id) => {
    const prevItems = get().items;
    const target = prevItems.find((item) => item.id === id);
    if (!target || target.is_read) return;

    const nextItems = prevItems.map((item) =>
      item.id === id ? { ...item, is_read: true } : item,
    );
    set({
      items: nextItems,
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      await apiClient.patch(ENDPOINTS.notifications.markRead(id));
    } catch {
      set({
        items: prevItems,
        unreadCount: prevItems.filter((item) => !item.is_read).length,
      });
    }
  },

  markAllRead: async () => {
    const prevItems = get().items;
    const prevUnread = get().unreadCount;
    if (prevUnread === 0) return;

    set({
      items: prevItems.map((item) => ({ ...item, is_read: true })),
      unreadCount: 0,
    });

    try {
      await apiClient.post(ENDPOINTS.notifications.markAllRead);
    } catch {
      set({ items: prevItems, unreadCount: prevUnread });
    }
  },

  reset: () => {
    set({
      items: [],
      unreadCount: 0,
      loading: false,
      error: null,
    });
  },
}));
