import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Music, Pause, Play, X } from 'lucide-react-native';

import { cn, formatDuration } from '@/lib/format';
import { usePlayerStore } from '@/store/player.store';

export interface MiniPlayerProps {
  className?: string;
}

export function MiniPlayer({ className }: MiniPlayerProps) {
  const router = useRouter();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const audioUrl = usePlayerStore((s) => s.audioUrl);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const error = usePlayerStore((s) => s.error);
  const clear = usePlayerStore((s) => s.clear);

  const player = useAudioPlayer(null, { updateInterval: 400 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!audioUrl) {
      player.pause();
      return;
    }
    player.replace({ uri: audioUrl });
    player.play();
  }, [audioUrl, player]);

  if (!currentTrack) return null;

  const duration = status.duration > 0 ? status.duration : 0;
  const currentTime = Math.min(status.currentTime ?? 0, duration || Infinity);
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isBusy = isLoading || (Boolean(audioUrl) && status.isBuffering && !status.playing);

  const handleTogglePlay = () => {
    if (!audioUrl || isLoading) return;
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (duration > 0 && currentTime >= duration - 0.5)) {
      void player.seekTo(0).then(() => player.play());
      return;
    }
    player.play();
  };

  const handleClose = () => {
    player.pause();
    clear();
  };

  const handleOpenDetail = () => {
    router.push(`/song/${currentTrack.id}` as never);
  };

  return (
    <View
      className={cn(
        'mx-3 mb-2 overflow-hidden rounded-2xl border border-borderStrong bg-card/95',
        className,
      )}
    >
      <Pressable
        onPress={handleOpenDetail}
        className="flex-row items-center gap-3 px-3 py-2.5 active:bg-cardHover"
      >
        <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-surface">
          {currentTrack.thumbnailUrl ? (
            <Image
              source={{ uri: currentTrack.thumbnailUrl }}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
            />
          ) : (
            <Music size={18} color="#d97745" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {currentTrack.title}
          </Text>
          {error ? (
            <Text className="text-xs text-danger" numberOfLines={1}>
              {error}
            </Text>
          ) : (
            <Text className="text-xs text-muted" numberOfLines={1}>
              {currentTrack.artist || 'MusicAI'}
              {duration > 0 ? ` · ${formatDuration(currentTime)} / ${formatDuration(duration)}` : ''}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleTogglePlay}
          disabled={!audioUrl || isLoading}
          accessibilityLabel={status.playing ? 'Pausar canción' : 'Reproducir canción'}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:bg-primaryHover"
        >
          {isBusy ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : status.playing ? (
            <Pause size={16} color="#000000" fill="#000000" />
          ) : (
            <Play size={16} color="#000000" fill="#000000" />
          )}
        </Pressable>

        <Pressable
          onPress={handleClose}
          accessibilityLabel="Cerrar reproductor"
          className="h-8 w-8 items-center justify-center rounded-full active:bg-surface"
        >
          <X size={16} color="#94a3b8" />
        </Pressable>
      </Pressable>

      <View className="h-1 w-full bg-surface">
        <View
          className="h-full bg-primary"
          style={{ width: `${progressPct}%` }}
        />
      </View>
    </View>
  );
}
