import { create } from 'zustand';

import {
  apiClient,
  clearStoredTokens,
  getStoredTokens,
  saveStoredTokens,
  setAuthCallbacks,
} from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { registerNativeFcmToken, type PushStatus } from '@/lib/push';
import { useNotificationsStore } from '@/store/notifications.store';
import { usePlayerStore } from '@/store/player.store';
import type { AuthTokens, BalanceResponse, UserProfile } from '@/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  balance: number;
  planName: string | null;
  hydrated: boolean;
  pushStatus: PushStatus;
  pushMessage: string | null;
  fcmToken: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  refreshBalance: () => Promise<void>;
  syncPushToken: () => Promise<void>;
  updateTokens: (access: string, refresh: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  balance: 0,
  planName: null,
  hydrated: false,
  pushStatus: 'idle',
  pushMessage: null,
  fcmToken: null,

  hydrate: async () => {
    try {
      const { access, refresh } = await getStoredTokens();
      if (!access || !refresh) {
        set({ hydrated: true });
        return;
      }

      set({ accessToken: access, refreshToken: refresh });
      const profile = await get().refreshProfile();
      if (profile) {
        await Promise.allSettled([get().refreshBalance(), get().syncPushToken()]);
      }
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    const tokens = await apiClient.post<AuthTokens>(
      ENDPOINTS.auth.login,
      { email: email.trim().toLowerCase(), password },
      { skipAuth: true },
    );

    await saveStoredTokens(tokens.access, tokens.refresh);
    set({
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
    });

    await Promise.all([get().refreshProfile(), get().refreshBalance()]);
    void get().syncPushToken();
  },

  logout: async () => {
    const refresh = get().refreshToken;
    if (refresh) {
      await apiClient.post(ENDPOINTS.auth.logout, { refresh }).catch(() => undefined);
    }

    await clearStoredTokens();
    usePlayerStore.getState().clear();
    useNotificationsStore.getState().reset();

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      balance: 0,
      planName: null,
      pushStatus: 'idle',
      pushMessage: null,
      fcmToken: null,
    });
  },

  refreshProfile: async () => {
    try {
      const user = await apiClient.get<UserProfile>(ENDPOINTS.auth.me);
      set({ user, balance: user.credit_balance ?? get().balance });
      return user;
    } catch {
      return null;
    }
  },

  refreshBalance: async () => {
    try {
      const data = await apiClient.get<BalanceResponse>(ENDPOINTS.credits.balance);
      set({
        balance: data.balance ?? 0,
        planName: data.plan?.name ?? null,
      });
    } catch {
      // Mantiene el último saldo conocido si falla la red.
    }
  },

  syncPushToken: async () => {
    if (!get().accessToken) return;
    const result = await registerNativeFcmToken();
    set({
      pushStatus: result.status,
      pushMessage: result.message ?? null,
      fcmToken: result.token ?? get().fcmToken,
    });
  },

  updateTokens: async (access, refresh) => {
    await saveStoredTokens(access, refresh);
    set({ accessToken: access, refreshToken: refresh });
  },
}));

// Sincroniza el cliente HTTP con el store al renovar o caducar la sesión.
setAuthCallbacks({
  onTokensUpdated: (access, refresh) => {
    useAuthStore.setState({ accessToken: access, refreshToken: refresh });
  },
  onAuthExpired: () => {
    usePlayerStore.getState().clear();
    useNotificationsStore.getState().reset();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      balance: 0,
      planName: null,
      pushStatus: 'idle',
      pushMessage: null,
      fcmToken: null,
    });
  },
});
