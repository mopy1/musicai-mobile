import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, Clock, Headphones, Heart, Music, Play, Share2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, type BadgeTone, Button, Card } from '@/components/ui';
import { fetchSongDetail, getSongPlayUrl, getSongThumbnailUrl, updateSong } from '@/features/songs/api';
import { formatDuration } from '@/lib/format';
import { usePlayerStore } from '@/store/player.store';
import type { SongDetail, SongStatus } from '@/types/api';

const STATUS_META: Record<SongStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: 'Lista', tone: 'success' },
  queued: { label: 'En cola', tone: 'warning' },
  processing: { label: 'Creando', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
  failed: { label: 'Error', tone: 'danger' },
};

export default function SongDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playSong = usePlayerStore((s) => s.playSong);

  const [song, setSong] = useState<SongDetail | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [canPublish, setCanPublish] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSong = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const detail = await fetchSongDetail(id);
      setSong(detail);
      setError(null);
      if (detail.thumbnail_s3_key) setThumbUrl(await getSongThumbnailUrl(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la canción.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadSong(); }, [loadSong]);

  const handleShareAudio = async () => {
    if (!song) return;
    setSharing(true);
    setError(null);
    try {
      const url = await getSongPlayUrl(song.id);
      if (await Sharing.isAvailableAsync()) {
        const dest = new File(Paths.cache, `musicai-${song.id}.mp3`);
        const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
        await Sharing.shareAsync(downloaded.uri, { mimeType: 'audio/mpeg', dialogTitle: `Compartir ${song.title}` });
      } else {
        await Share.share({ message: `Escucha "${song.title}" en MusicAI: ${url}`, url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo compartir el audio.');
    } finally {
      setSharing(false);
    }
  };

  const handleTogglePublic = async (nextPublic: boolean) => {
    if (!song || toggling) return;
    setToggling(true);
    setError(null);
    try {
      setSong(await updateSong(song.id, { is_public: nextPublic }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cambiar la visibilidad.';
      if (msg.includes('403') || msg.toLowerCase().includes('permiso')) setCanPublish(false);
      else setError(msg);
    } finally {
      setToggling(false);
    }
  };

  const meta = song ? STATUS_META[song.status] ?? STATUS_META.processing : null;
  const showPublishSwitch =
    Boolean(song) && canPublish && song?.status === 'ready' &&
    (song.source_type === 'generated' || song.source_type === 'hummed' || !song.is_public);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-night">
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:bg-cardHover"
        >
          <ChevronLeft size={20} color="#ffffff" />
        </Pressable>
        <Text className="flex-1 text-base font-semibold text-white" numberOfLines={1}>
          Detalle de canción
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#d97745" /></View>
      ) : !song ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-danger">{error || 'Canción no encontrada.'}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
          <View className="items-center pt-2">
            <View className="h-56 w-56 items-center justify-center overflow-hidden rounded-3xl border border-borderStrong bg-surface">
              {thumbUrl ? (
                <Image source={{ uri: thumbUrl }} style={{ width: 224, height: 224 }} contentFit="cover" />
              ) : (
                <Music size={60} color="#d97745" />
              )}
            </View>
            <Text className="mt-4 text-center text-2xl font-bold text-white">{song.title}</Text>
            <View className="mt-2 flex-row flex-wrap items-center justify-center gap-2">
              {meta ? <Badge label={meta.label} tone={meta.tone} /> : null}
              <Badge label={song.is_public ? 'Pública' : 'Privada'} tone={song.is_public ? 'primary' : 'neutral'} />
              {song.tags.map((t) => (
                <Badge key={String(t.id)} label={`${t.emoji ? `${t.emoji} ` : ''}${t.name}`} />
              ))}
            </View>
          </View>

          <Card className="flex-row justify-around py-3">
            <View className="items-center gap-1">
              <Clock size={16} color="#94a3b8" />
              <Text className="text-xs font-semibold text-white">{formatDuration(song.audio_duration)}</Text>
            </View>
            <View className="items-center gap-1">
              <Headphones size={16} color="#94a3b8" />
              <Text className="text-xs font-semibold text-white">{song.play_count}</Text>
            </View>
            <View className="items-center gap-1">
              <Heart size={16} color="#d97745" />
              <Text className="text-xs font-semibold text-white">{song.like_count}</Text>
            </View>
          </Card>

          <View className="gap-2.5">
            <Button
              label="Reproducir" variant="primary" size="lg" fullWidth disabled={song.status !== 'ready'}
              leftIcon={<Play size={18} color="#000000" fill="#000000" />}
              onPress={() => void playSong({ id: song.id, title: song.title, artist: 'MusicAI', thumbnailUrl: thumbUrl })}
            />
            <Button
              label="Compartir audio" variant="secondary" fullWidth loading={sharing} disabled={song.status !== 'ready'}
              leftIcon={<Share2 size={16} color="#ffffff" />}
              onPress={() => void handleShareAudio()}
            />
          </View>

          {showPublishSwitch ? (
            <Card className="gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-sm font-semibold text-white">Publicar en la comunidad</Text>
                <Switch value={song.is_public} disabled={toggling} onValueChange={(v) => void handleTogglePublic(v)} trackColor={{ false: '#334155', true: '#d97745' }} thumbColor="#ffffff" />
              </View>
              <Text className="text-xs leading-5 text-muted">Al hacerla pública se envía una notificación push a la comunidad.</Text>
            </Card>
          ) : null}

          {error ? (
            <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
              <Text className="text-xs text-danger">{error}</Text>
            </View>
          ) : null}

          {song.lyrics || song.description ? (
            <Card className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-primary">{song.lyrics ? 'Letra' : 'Descripción'}</Text>
              <Text className="text-sm leading-6 text-white/90">{song.lyrics || song.description}</Text>
            </Card>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
