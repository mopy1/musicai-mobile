import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, Coins, Mic, Music, Sparkles, Video } from 'lucide-react-native';

import { formatRelativeDate } from '@/lib/format';
import type { AppNotification } from '@/types/api';

export interface NotificationItemProps {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
}

interface IconMeta {
  icon: ReactNode;
  bgClass: string;
}

function getNotificationIconMeta(type: string): IconMeta {
  switch (type) {
    case 'song_ready':
    case 'song_published':
      return {
        icon: <Music size={18} color="#d97745" />,
        bgClass: 'bg-primary/15 border-primary/30',
      };
    case 'faceswap_ready':
      return {
        icon: <Video size={18} color="#ee9a6a" />,
        bgClass: 'bg-primary/15 border-primary/30',
      };
    case 'stem_ready':
    case 'mix_ready':
    case 'translation_ready':
      return {
        icon: <Sparkles size={18} color="#38bdf8" />,
        bgClass: 'bg-sky-500/15 border-sky-400/30',
      };
    case 'karaoke_ready':
    case 'humming_ready':
      return {
        icon: <Mic size={18} color="#34d399" />,
        bgClass: 'bg-success/15 border-success/30',
      };
    case 'credit_grant':
      return {
        icon: <Coins size={18} color="#fbbf24" />,
        bgClass: 'bg-warning/15 border-warning/30',
      };
    default:
      return {
        icon: <Bell size={18} color="#94a3b8" />,
        bgClass: 'bg-surface border-borderStrong',
      };
  }
}

export function NotificationItem({ item, onPress }: NotificationItemProps) {
  const { icon, bgClass } = getNotificationIconMeta(item.type);
  const unread = !item.is_read;

  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`flex-row items-start gap-3 rounded-2xl border px-3.5 py-3 active:bg-cardHover ${
        unread
          ? 'border-primary/35 bg-card'
          : 'border-borderSubtle bg-card/65'
      }`}
    >
      <View
        className={`mt-0.5 h-10 w-10 items-center justify-center rounded-xl border ${bgClass}`}
      >
        {icon}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className={`flex-1 text-sm ${unread ? 'font-bold text-white' : 'font-semibold text-white/90'}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {unread ? (
            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
          ) : null}
        </View>

        <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={3}>
          {item.message}
        </Text>

        <Text className="mt-1.5 text-[11px] font-medium text-muted/80">
          {formatRelativeDate(item.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}
