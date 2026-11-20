import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Check, CheckCircle2, Image as ImageIcon, Wand2 } from 'lucide-react-native';

import { Button, Card } from '@/components/ui';
import { createFaceSwapJob, fetchFaceSwapTemplates } from '@/features/faceswap/api';
import { cn } from '@/lib/format';
import { useAuthStore } from '@/store/auth.store';
import type { FaceSwapTemplate } from '@/types/api';

interface PickedPhoto {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
}

export function CreateFaceswapForm() {
  const router = useRouter();
  const refreshBalance = useAuthStore((s) => s.refreshBalance);

  const [templates, setTemplates] = useState<FaceSwapTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchFaceSwapTemplates()
      .then((list) => {
        if (!active) return;
        setTemplates(list);
        if (list.length > 0) setSelectedId((prev) => prev ?? list[0].id);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Error cargando plantillas.'))
      .finally(() => active && setLoadingTemplates(false));
    return () => { active = false; };
  }, []);

  const pickPhoto = async (source: 'camera' | 'gallery') => {
    setError(null);
    const isCam = source === 'camera';
    const perm = isCam
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      setError(
        isCam
          ? 'Necesitamos permiso de cámara para tomar tu selfie.'
          : 'Necesitamos permiso de galería para elegir tu foto.',
      );
      return;
    }

    const res = isCam
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });

    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setPhoto({ uri: a.uri, name: a.fileName, mimeType: a.mimeType });
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return setError('Selecciona una plantilla de video.');
    if (!photo) return setError('Toma una selfie o elige una foto de tu galería.');
    if (!consent) return setError('Debes confirmar el permiso para usar esta fotografía.');

    setSubmitting(true);
    setError(null);
    try {
      const res = await createFaceSwapJob({
        photoUri: photo.uri, photoName: photo.name, photoMimeType: photo.mimeType, templateId: selectedId,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void refreshBalance();
      setCreatedJobId(res.job_id);
      setPhoto(null);
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el cambio de caras.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-4">
      {createdJobId ? (
        <Card className="gap-3 border-success/40 bg-success/10">
          <View className="flex-row items-start gap-2.5">
            <CheckCircle2 size={20} color="#34d399" />
            <Text className="flex-1 text-xs leading-5 text-white/95">
              Video en proceso. Te avisaremos con una notificación push cuando esté listo.
            </Text>
          </View>
          <Button label="Ver progreso del video" variant="secondary" size="sm" onPress={() => router.push(`/faceswap/${createdJobId}` as never)} />
        </Card>
      ) : null}

      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted">1. Elige una plantilla</Text>
        {loadingTemplates ? (
          <View className="items-center py-6"><ActivityIndicator color="#d97745" /></View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {templates.map((tpl) => (
              <Pressable
                key={tpl.id}
                onPress={() => setSelectedId(tpl.id)}
                className={cn(
                  'w-36 overflow-hidden rounded-2xl border-2 bg-card',
                  tpl.id === selectedId ? 'border-primary' : 'border-borderSubtle',
                )}
              >
                <Image source={{ uri: tpl.thumbnail_url }} style={{ width: '100%', height: 108 }} contentFit="cover" />
                <View className="p-2.5">
                  <Text className="text-xs font-semibold text-white" numberOfLines={1}>{tpl.title}</Text>
                  <Text className="text-[11px] text-muted">{Math.round(tpl.duration_seconds)} s</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted">2. Selecciona tu rostro</Text>
        {photo ? (
          <Card className="flex-row items-center gap-3.5 p-3">
            <Image source={{ uri: photo.uri }} style={{ width: 68, height: 68, borderRadius: 16 }} contentFit="cover" />
            <View className="flex-1 gap-1.5">
              <Text className="text-sm font-semibold text-white">Foto lista</Text>
              <Button label="Cambiar foto" variant="secondary" size="sm" onPress={() => setPhoto(null)} />
            </View>
          </Card>
        ) : (
          <View className="flex-row gap-2.5">
            <Button label="Tomar selfie" variant="secondary" className="flex-1" leftIcon={<Camera size={16} color="#d97745" />} onPress={() => void pickPhoto('camera')} />
            <Button label="Elegir de galería" variant="secondary" className="flex-1" leftIcon={<ImageIcon size={16} color="#d97745" />} onPress={() => void pickPhoto('gallery')} />
          </View>
        )}
      </View>

      <Pressable onPress={() => setConsent((v) => !v)} className="flex-row items-center gap-3 rounded-2xl border border-borderSubtle bg-card p-3.5">
        <View className={cn('h-5 w-5 items-center justify-center rounded-md border', consent ? 'border-primary bg-primary' : 'border-borderStrong bg-surface')}>
          {consent ? <Check size={14} color="#000000" strokeWidth={3} /> : null}
        </View>
        <Text className="flex-1 text-xs leading-5 text-white/90">Confirmo que tengo permiso para usar esta fotografía</Text>
      </Pressable>

      {error ? (
        <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
          <Text className="text-xs text-danger">{error}</Text>
        </View>
      ) : null}

      <Button
        label="Intercambiar rostro" variant="primary" size="lg" fullWidth costCredits={3} loading={submitting}
        leftIcon={<Wand2 size={18} color="#000000" />}
        onPress={() => void handleSubmit()}
      />
    </View>
  );
}
