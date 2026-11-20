import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Clock, Film, Sparkles } from 'lucide-react-native';

import { Badge, type BadgeTone, Card, EmptyState } from '@/components/ui';
import { fetchFaceSwapJobs } from '@/features/faceswap/api';
import { formatDuration, formatRelativeDate } from '@/lib/format';
import type { FaceSwapJob, FaceSwapJobStatus } from '@/types/api';

const STATUS_META: Record<FaceSwapJobStatus, { label: string; tone: BadgeTone }> = {
  queued: { label: 'En cola', tone: 'warning' },
  processing: { label: 'Procesando', tone: 'primary' },
  completed: { label: 'Listo', tone: 'success' },
  failed: { label: 'Fallido', tone: 'danger' },
};

export function LibraryFaceswapList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<FaceSwapJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchFaceSwapJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus videos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadJobs();
    }, [loadJobs]),
  );

  const hasActive = jobs.some((j) => j.status === 'queued' || j.status === 'processing');

  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => void loadJobs(), 5000);
    return () => clearInterval(timer);
  }, [hasActive, loadJobs]);

  if (loading && jobs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#d97745" />
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 112, gap: 12 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadJobs(true)}
          tintColor="#d97745"
          colors={['#d97745']}
        />
      }
      ListHeaderComponent={
        error ? (
          <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
            <Text className="text-xs text-danger">{error}</Text>
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        <EmptyState
          icon={<Film size={32} color="#d97745" />}
          title="Sin videos de cambio de caras"
          description="Elige una plantilla musical, sube tu selfie y crea tu primer video."
          actionLabel="Crear video"
          onAction={() => router.push('/(tabs)/create?mode=faceswap' as never)}
          className="mt-4"
        />
      }
      renderItem={({ item }) => {
        const meta = STATUS_META[item.status] ?? STATUS_META.processing;
        const isActive = item.status === 'queued' || item.status === 'processing';
        const pct = Math.max(0, Math.min(100, Math.round(item.progress_pct || 0)));
        const title =
          item.template?.title || item.source_video_filename || 'Video Faceswap';

        return (
          <Card
            onPress={() => router.push(`/faceswap/${item.id}` as never)}
            className="gap-3 p-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface">
                {isActive ? (
                  <ActivityIndicator size="small" color="#d97745" />
                ) : (
                  <Sparkles size={20} color="#d97745" />
                )}
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                  {title}
                </Text>
                <View className="flex-row flex-wrap items-center gap-2">
                  <Badge label={meta.label} tone={meta.tone} />
                  {item.source_duration_seconds ? (
                    <View className="flex-row items-center gap-1">
                      <Clock size={12} color="#94a3b8" />
                      <Text className="text-xs text-muted">
                        {formatDuration(item.source_duration_seconds)}
                      </Text>
                    </View>
                  ) : null}
                  <Text className="text-xs text-muted">
                    {formatRelativeDate(item.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            {isActive ? (
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-[11px] text-muted">Progreso del video</Text>
                  <Text className="text-[11px] font-semibold text-primary">{pct}%</Text>
                </View>
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(6, pct)}%` }}
                  />
                </View>
              </View>
            ) : null}
          </Card>
        );
      }}
    />
  );
}
