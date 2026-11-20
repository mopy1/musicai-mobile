import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Music, Play, Sparkles } from 'lucide-react-native';

import { Badge, type BadgeTone, Card, EmptyState } from '@/components/ui';
import { fetchActiveSongJobs, fetchLibrarySongs } from '@/features/songs/api';
import { formatDuration } from '@/lib/format';
import { usePlayerStore } from '@/store/player.store';
import type { GenerationJob, LibrarySong, SongStatus } from '@/types/api';

const STATUS_META: Record<SongStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: 'Lista', tone: 'success' },
  queued: { label: 'En cola', tone: 'warning' },
  processing: { label: 'Creando', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
  failed: { label: 'Error', tone: 'danger' },
};

export function LibrarySongsList() {
  const router = useRouter();
  const playSong = usePlayerStore((s) => s.playSong);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);

  const [songs, setSongs] = useState<LibrarySong[]>([]);
  const [activeJobs, setActiveJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [libraryData, jobsData] = await Promise.all([
        fetchLibrarySongs(),
        fetchActiveSongJobs().catch(() => [] as GenerationJob[]),
      ]);
      setSongs(libraryData);
      setActiveJobs(
        jobsData.filter((j) => j.status === 'queued' || j.status === 'processing'),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar tu biblioteca.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  useEffect(() => {
    if (activeJobs.length === 0) return;
    const timer = setInterval(() => void loadData(), 6000);
    return () => clearInterval(timer);
  }, [activeJobs.length, loadData]);

  if (loading && songs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#d97745" />
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 112, gap: 12 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadData(true)}
          tintColor="#d97745"
          colors={['#d97745']}
        />
      }
      ListHeaderComponent={
        <View className="gap-3">
          {activeJobs.length > 0 ? (
            <View className="flex-row items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-3.5">
              <ActivityIndicator size="small" color="#d97745" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  {activeJobs.length === 1
                    ? `Generando "${activeJobs[0].song_title || activeJobs[0].title}"`
                    : `${activeJobs.length} canciones en creación`}
                </Text>
                <Text className="mt-0.5 text-xs text-muted">
                  Te enviaremos una notificación push en cuanto esté lista.
                </Text>
              </View>
            </View>
          ) : null}
          {error ? (
            <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
              <Text className="text-xs text-danger">{error}</Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={<Sparkles size={32} color="#d97745" />}
          title="Aún no tienes canciones"
          description="Describe un estilo o estado de ánimo y crea tu primera pista con IA."
          actionLabel="Crear canción"
          onAction={() => router.push('/(tabs)/create' as never)}
          className="mt-4"
        />
      }
      renderItem={({ item }) => {
        const meta = STATUS_META[item.status] ?? STATUS_META.processing;
        const canPlay = item.status === 'ready';
        const isCurrent = currentTrackId === item.id;

        return (
          <Card
            onPress={() => router.push(`/song/${item.id}` as never)}
            className="flex-row items-center gap-3 p-3"
          >
            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface">
              {item.thumbnail_url ? (
                <Image
                  source={{ uri: item.thumbnail_url }}
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                />
              ) : (
                <Music size={22} color="#d97745" />
              )}
            </View>

            <View className="flex-1 gap-1.5">
              <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Badge label={meta.label} tone={meta.tone} />
                <Badge
                  label={item.is_public ? 'Pública' : 'Privada'}
                  tone={item.is_public ? 'primary' : 'neutral'}
                />
                {item.audio_duration ? (
                  <Text className="text-xs text-muted">
                    {formatDuration(item.audio_duration)}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              disabled={!canPlay}
              onPress={(e) => {
                e.stopPropagation();
                if (!canPlay) return;
                void playSong({
                  id: item.id,
                  title: item.title,
                  artist: 'Mi biblioteca',
                  thumbnailUrl: item.thumbnail_url,
                });
              }}
              accessibilityLabel={`Reproducir ${item.title}`}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                canPlay
                  ? isCurrent
                    ? 'bg-primaryHover'
                    : 'bg-primary active:bg-primaryHover'
                  : 'bg-surface opacity-40'
              }`}
            >
              <Play size={16} color="#000000" fill="#000000" />
            </Pressable>
          </Card>
        );
      }}
    />
  );
}
