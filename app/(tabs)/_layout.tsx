import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Bell, Home, Library, Sparkles, User } from 'lucide-react-native';

import { MiniPlayer } from '@/components/MiniPlayer';
import { useNotificationsStore } from '@/store/notifications.store';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const tabBarHeight = 60 + insets.bottom;
  const badgeValue = unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined;

  return (
    <View className="flex-1 bg-night">
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: '#070b14' },
          tabBarActiveTintColor: '#d97745',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopColor: '#1f2937',
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Biblioteca',
            tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Crear',
            tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Avisos',
            tabBarBadge: badgeValue,
            tabBarBadgeStyle: {
              backgroundColor: '#d97745',
              color: '#000000',
              fontWeight: '700',
            },
            tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: tabBarHeight,
        }}
      >
        <MiniPlayer />
      </View>
    </View>
  );
}
