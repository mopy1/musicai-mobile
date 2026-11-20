import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BellOff, CheckCheck } from 'lucide-react-native';

import { Button, EmptyState, ScreenHeader } from '@/components/ui';
import { NotificationItem } from '@/features/notifications/NotificationItem';
import { resolveNotificationRoute } from '@/lib/push';
import { useNotificationsStore } from '@/store/notifications.store';
import { usePlayerStore } from '@/store/player.store';
import type { AppNotification } from '@/types/api';

export default function NotificationsScreen() {
  const router = useRouter();
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loading = useNotificationsStore((s) => s.loading);
  const error = useNotificationsStore((s) => s.error);
  const fetchNotifications = useNotificationsStore((s) => s.fetch);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handlePressItem = (item: AppNotification) => {
    void markRead(item.id);
    const route = resolveNotificationRoute({
      type: item.type,
      reference_id: item.reference_id,
    });
    router.push(route as never);
  };

  const subtitle =
    unreadCount > 0
      ? unreadCount === 1
        ? '1 aviso sin leer'
        : `${unreadCount} avisos sin leer`
      : 'Estás al día';

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <View className="px-4 pt-2">
        <ScreenHeader
          title="Avisos"
          subtitle={subtitle}
          rightSlot={
            unreadCount > 0 ? (
              <Button
                label="Leer todas"
                variant="ghost"
                size="sm"
                leftIcon={<CheckCheck size={15} color="#d97745" />}
                onPress={() => void markAllRead()}
              />
            ) : null
          }
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handlePressItem} />
        )}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: hasMiniPlayer ? 104 : 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#d97745"
            colors={['#d97745']}
          />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View className="items-center py-12">
              <ActivityIndicator size="small" color="#d97745" />
              <Text className="mt-2 text-xs text-muted">Cargando notificaciones...</Text>
            </View>
          ) : (
            <EmptyState
              icon={<BellOff size={28} color="#64748b" />}
              title={error ? 'No se pudieron cargar tus avisos' : 'Sin notificaciones aún'}
              description={
                error ||
                'Cuando tus canciones o videos estén listos, los verás aquí y recibirás un aviso push.'
              }
              actionLabel={error ? 'Reintentar' : undefined}
              onAction={error ? () => void handleRefresh() : undefined}
              className="mt-4"
            />
          )
        }
      />
    </SafeAreaView>
  );
}
