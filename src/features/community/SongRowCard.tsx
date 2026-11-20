import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, Music, Play } from 'lucide-react-native';

import { usePlayerStore } from '@/store/player.store';
import type { CommunitySong } from '@/types/api';

export interface SongRowCardProps {
  song: CommunitySong;
  onToggleLike: (song: CommunitySong) => void;
}

export function SongRowCard({ song, onToggleLike }: SongRowCardProps) {
  const router = useRouter();
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id ?? null);
  const playSong = usePlayerStore((s) => s.playSong);

  const isCurrent = currentTrackId === song.id;
  const visibleTags = (song.tags ?? []).slice(0, 2);

  const handlePlay = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    void playSong({
      id: song.id,
      title: song.title,
      artist: song.user_name,
      thumbnailUrl: song.thumbnail_url,
    });
  };

  const handleLike = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onToggleLike(song);
  };

  return (
    <View
      className={`flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 ${
        isCurrent
          ? 'border-primary/45 bg-surface'
          : 'border-borderSubtle bg-card'
      }`}
    >
      <Pressable
        onPress={() => router.push(`/song/${song.id}` as never)}
        className="flex-1 flex-row items-center gap-3 active:opacity-80"
      >
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface">
          {song.thumbnail_url ? (
            <Image
              source={{ uri: song.thumbnail_url }}
              style={{ width: 56, height: 56 }}
              contentFit="cover"
            />
          ) : (
            <Music size={22} color="#d97745" />
          )}
        </View>

        <View className="flex-1">
          <Text
            className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-white'}`}
            numberOfLines={1}
          >
            {song.title}
          </Text>
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {song.user_name || 'Artista MusicAI'}
          </Text>

          {visibleTags.length > 0 ? (
            <View className="mt-1.5 flex-row flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <View
                  key={String(tag.id)}
                  className="rounded-md border border-borderStrong/80 bg-surface px-1.5 py-0.5"
                >
                  <Text className="text-[10px] font-medium text-muted" numberOfLines={1}>
                    {tag.emoji ? `${tag.emoji} ` : ''}
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={handleLike}
          hitSlop={8}
          accessibilityLabel={song.is_liked ? 'Quitar me gusta' : 'Dar me gusta'}
          className="items-center justify-center px-1.5 py-1 active:opacity-75"
        >
          <Heart
            size={18}
            color={song.is_liked ? '#fb7185' : '#94a3b8'}
            fill={song.is_liked ? '#fb7185' : 'transparent'}
          />
          <Text className="mt-0.5 text-[10px] font-medium text-muted">
            {song.like_count}
          </Text>
        </Pressable>

        <Pressable
          onPress={handlePlay}
          accessibilityLabel={`Reproducir ${song.title}`}
          className={`h-9 w-9 items-center justify-center rounded-full active:opacity-80 ${
            isCurrent
              ? 'bg-primary'
              : 'border border-primary/40 bg-primary/15'
          }`}
        >
          <Play
            size={15}
            color={isCurrent ? '#000000' : '#d97745'}
            fill={isCurrent ? '#000000' : '#d97745'}
          />
        </Pressable>
      </View>
    </View>
  );
}
