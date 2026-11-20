import '../src/global.css';

import { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, Image, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { resolveNotificationRoute, type NotificationPayloadData } from '@/lib/push';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';

function extractNotificationData(
  response: Notifications.NotificationResponse,
): NotificationPayloadData {
  const raw = response.notification.request.content.data;
  if (raw && typeof raw === 'object') {
    return raw as NotificationPayloadData;
  }
  return {};
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const syncPushToken = useAuthStore((s) => s.syncPushToken);
  const refreshBalance = useAuthStore((s) => s.refreshBalance);

  const handledColdStartRef = useRef(false);
  const lastHandledIdRef = useRef<string | null>(null);

  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const inLogin = segments[0] === 'login';

    if (!accessToken && !inLogin) {
      router.replace('/login' as never);
    } else if (accessToken && inLogin) {
      router.replace('/(tabs)' as never);
    }
  }, [hydrated, accessToken, segments, router]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;

    void syncPushToken();
    void refreshBalance();
    void useNotificationsStore.getState().fetch();
  }, [hydrated, accessToken, syncPushToken, refreshBalance]);

  useEffect(() => {
    let prevState = AppState.currentState;
    const sub = AppState.addEventListener('change', (nextState) => {
      const becameActive = prevState !== 'active' && nextState === 'active';
      prevState = nextState;

      if (becameActive && useAuthStore.getState().accessToken) {
        void useNotificationsStore.getState().fetch();
        void useAuthStore.getState().refreshBalance();
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      if (useAuthStore.getState().accessToken) {
        void useNotificationsStore.getState().fetch();
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const identifier = response.notification.request.identifier;
      if (identifier && lastHandledIdRef.current === identifier) return;
      lastHandledIdRef.current = identifier ?? null;

      if (!useAuthStore.getState().accessToken) return;

      const route = resolveNotificationRoute(extractNotificationData(response));
      void useNotificationsStore.getState().fetch();
      router.push(route as never);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);

  useEffect(() => {
    if (!hydrated || !accessToken || handledColdStartRef.current) return;
    handledColdStartRef.current = true;

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        const identifier = response.notification.request.identifier;
        if (identifier && lastHandledIdRef.current === identifier) return;
        lastHandledIdRef.current = identifier ?? null;

        const route = resolveNotificationRoute(extractNotificationData(response));
        void useNotificationsStore.getState().fetch();
        router.push(route as never);
      })
      .catch(() => undefined);
  }, [hydrated, accessToken, router]);

  if (!hydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#070b14' }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <View className="flex-1 items-center justify-center bg-night px-6">
            <View className="mb-5 h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-primary/30 bg-card">
              <Image
                source={require('../assets/images/icon.png')}
                style={{ width: 88, height: 88 }}
                resizeMode="cover"
              />
            </View>
            <Text className="mb-4 text-xl font-bold tracking-tight text-white">MusicAI</Text>
            <ActivityIndicator size="small" color="#d97745" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#070b14' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#070b14' },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="song/[id]" />
          <Stack.Screen name="faceswap/[id]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
