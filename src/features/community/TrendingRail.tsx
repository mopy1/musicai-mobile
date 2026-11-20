import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Flame, Heart, Music, Play } from 'lucide-react-native';

import { usePlayerStore } from '@/store/player.store';
import type { CommunitySong } from '@/types/api';

export interface TrendingRailProps {
  songs: CommunitySong[];
}

export function TrendingRail({ songs }: TrendingRailProps) {
  const router = useRouter();
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id ?? null);
  const playSong = usePlayerStore((s) => s.playSong);

  if (songs.length === 0) return null;

  return (
    <View className="mt-5">
      <View className="mb-3 flex-row items-center gap-2">
        <Flame size={16} color="#d97745" />
        <Text className="text-base font-bold text-white">Tendencias</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        {songs.map((song) => {
          const isCurrent = currentTrackId === song.id;
          return (
            <View
              key={song.id}
              className="w-40 overflow-hidden rounded-2xl border border-borderSubtle bg-card"
            >
              <Pressable
                onPress={() => router.push(`/song/${song.id}` as never)}
                className="active:opacity-90"
              >
                <View className="relative h-36 w-full items-center justify-center bg-surface">
                  {song.thumbnail_url ? (
                    <Image
                      source={{ uri: song.thumbnail_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                      <Music size={26} color="#d97745" />
                    </View>
                  )}

                  <Pressable
                    onPress={() =>
                      void playSong({
                        id: song.id,
                        title: song.title,
                        artist: song.user_name,
                        thumbnailUrl: song.thumbnail_url,
                      })
                    }
                    accessibilityLabel={`Reproducir ${song.title}`}
                    className={`absolute bottom-2.5 right-2.5 h-9 w-9 items-center justify-center rounded-full shadow ${
                      isCurrent ? 'bg-primaryHover' : 'bg-primary'
                    }`}
                  >
                    <Play size={15} color="#000000" fill="#000000" />
                  </Pressable>
                </View>

                <View className="p-3">
                  <Text
                    className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-white'}`}
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                    {song.user_name || 'Artista MusicAI'}
                  </Text>
                  <View className="mt-2 flex-row items-center gap-1">
                    <Heart
                      size={12}
                      color={song.is_liked ? '#fb7185' : '#94a3b8'}
                      fill={song.is_liked ? '#fb7185' : 'transparent'}
                    />
                    <Text className="text-[11px] font-medium text-muted">
                      {song.like_count}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
