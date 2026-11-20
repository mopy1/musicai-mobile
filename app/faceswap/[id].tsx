import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { VideoView, useVideoPlayer } from 'expo-video';
import { AlertCircle, ChevronLeft, Clock, Share2, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, type BadgeTone, Button, Card } from '@/components/ui';
import { fetchFaceSwapJob, getFaceSwapResultUrl } from '@/features/faceswap/api';
import { formatDuration, formatRelativeDate } from '@/lib/format';
import type { FaceSwapJob, FaceSwapJobStatus } from '@/types/api';

const STATUS_META: Record<FaceSwapJobStatus, { label: string; tone: BadgeTone }> = {
  queued: { label: 'En cola', tone: 'warning' },
  processing: { label: 'Procesando', tone: 'primary' },
  completed: { label: 'Completado', tone: 'success' },
  failed: { label: 'Fallido', tone: 'danger' },
};

function VideoResultPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.play();
  });

  return (
    <View className="overflow-hidden rounded-3xl border border-borderStrong bg-black">
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        style={{ width: '100%', aspectRatio: 16 / 10 }}
      />
    </View>
  );
}

export default function FaceSwapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [job, setJob] = useState<FaceSwapJob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchFaceSwapJob(id);
      setJob(data);
      setError(null);
      if (data.status === 'completed' && data.has_result && !resultUrl) {
        setResultUrl(await getFaceSwapResultUrl(id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el video.');
    } finally {
      setLoading(false);
    }
  }, [id, resultUrl]);

  useEffect(() => { void loadJob(); }, [loadJob]);

  const isActive = job?.status === 'queued' || job?.status === 'processing';
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => void loadJob(), 5000);
    return () => clearInterval(timer);
  }, [isActive, loadJob]);

  const handleShareVideo = async () => {
    if (!job) return;
    setSharing(true);
    setError(null);
    try {
      const url = resultUrl || (await getFaceSwapResultUrl(job.id, true));
      if (await Sharing.isAvailableAsync()) {
        const dest = new File(Paths.cache, `musicai-faceswap-${job.id}.mp4`);
        const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
        await Sharing.shareAsync(downloaded.uri, { mimeType: 'video/mp4', dialogTitle: 'Compartir video de MusicAI' });
      } else {
        await Share.share({ message: `Mira mi video creado en MusicAI: ${url}`, url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar el video.');
    } finally {
      setSharing(false);
    }
  };

  const pct = Math.max(0, Math.min(100, Math.round(job?.progress_pct || 0)));
  const title = job?.template?.title || job?.source_video_filename || 'Video Faceswap';
  const meta = job ? STATUS_META[job.status] ?? STATUS_META.processing : null;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-night">
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:bg-cardHover"
        >
          <ChevronLeft size={20} color="#ffffff" />
        </Pressable>
        <Text className="flex-1 text-base font-semibold text-white" numberOfLines={1}>Cambiar caras</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#d97745" /></View>
      ) : !job ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-danger">{error || 'Video no encontrado.'}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 96, gap: 16 }} showsVerticalScrollIndicator={false}>
          <View className="gap-2 pt-2">
            <Text className="text-2xl font-bold text-white">{title}</Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {meta ? <Badge label={meta.label} tone={meta.tone} /> : null}
              {job.source_duration_seconds ? (
                <View className="flex-row items-center gap-1">
                  <Clock size={13} color="#94a3b8" />
                  <Text className="text-xs text-muted">{formatDuration(job.source_duration_seconds)}</Text>
                </View>
              ) : null}
              <Text className="text-xs text-muted">{formatRelativeDate(job.created_at)}</Text>
            </View>
          </View>

          {isActive ? (
            <Card className="items-center gap-4 py-8">
              <ActivityIndicator size="large" color="#d97745" />
              <Text className="text-base font-semibold text-white">Procesando video · {pct}%</Text>
              <Text className="text-center text-xs leading-5 text-muted">
                Puedes salir de esta pantalla; te avisaremos con una notificación push al terminar.
              </Text>
              <View className="h-2 w-full overflow-hidden rounded-full bg-surface">
                <View className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, pct)}%` }} />
              </View>
            </Card>
          ) : null}

          {job.status === 'completed' && resultUrl ? (
            <>
              <VideoResultPlayer uri={resultUrl} />
              <Button
                label="Compartir / Guardar video"
                variant="primary"
                size="lg"
                fullWidth
                loading={sharing}
                leftIcon={<Share2 size={18} color="#000000" />}
                onPress={() => void handleShareVideo()}
              />
            </>
          ) : null}

          {job.status === 'failed' ? (
            <Card className="gap-3 border-danger/40 bg-danger/10">
              <View className="flex-row items-start gap-2.5">
                <AlertCircle size={20} color="#fb7185" />
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-semibold text-danger">No se pudo completar el video</Text>
                  <Text className="text-xs leading-5 text-white/90">
                    {job.error_message || 'Ocurrió un error al procesar el rostro en el video.'}
                  </Text>
                </View>
              </View>
              <Button
                label="Intentar de nuevo"
                variant="secondary"
                leftIcon={<Sparkles size={16} color="#d97745" />}
                onPress={() => router.replace('/(tabs)/create?mode=faceswap' as never)}
              />
            </Card>
          ) : null}

          {error ? (
            <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
              <Text className="text-xs text-danger">{error}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
