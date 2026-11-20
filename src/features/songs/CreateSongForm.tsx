import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CheckCircle2, Sparkles } from 'lucide-react-native';

import { Button, Card, Input } from '@/components/ui';
import { generateSong } from '@/features/songs/api';
import { cn } from '@/lib/format';
import { useAuthStore } from '@/store/auth.store';

type LanguageOption = 'es' | 'en';
type VocalOption = 'auto' | 'female' | 'male';

const LANGUAGES: { value: LanguageOption; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
];
const VOCALS: { value: VocalOption; label: string }[] = [
  { value: 'auto', label: 'Automática' },
  { value: 'female', label: 'Femenina' },
  { value: 'male', label: 'Masculina' },
];
const DURATIONS: { value: number; label: string; hint?: string }[] = [
  { value: 30, label: '30 s', hint: 'Rápido' },
  { value: 60, label: '60 s' },
  { value: 120, label: '120 s' },
];

function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-medium uppercase tracking-wider text-muted">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              className={cn(
                'flex-1 items-center rounded-xl border py-2.5',
                active ? 'border-primary bg-primary/15' : 'border-borderStrong bg-surface',
              )}
            >
              <Text className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-white')}>
                {opt.label}
              </Text>
              {opt.hint ? <Text className="text-[10px] text-muted">{opt.hint}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CreateSongForm() {
  const router = useRouter();
  const refreshBalance = useAuthStore((s) => s.refreshBalance);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [language, setLanguage] = useState<LanguageOption>('es');
  const [vocalType, setVocalType] = useState<VocalOption>('auto');
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedTitle, setQueuedTitle] = useState<string | null>(null);

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    if (!cleanTitle) return setError('Escribe un título para tu canción.');
    if (!cleanDesc) return setError('Describe el estilo musical o la idea de tu canción.');

    setSubmitting(true);
    setError(null);
    try {
      await generateSong({
        title: cleanTitle,
        description: cleanDesc,
        instrumental,
        language,
        vocal_type: instrumental ? 'auto' : vocalType,
        audio_duration: duration,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void refreshBalance();
      setQueuedTitle(cleanTitle);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la canción.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-4">
      {queuedTitle ? (
        <Card className="gap-3 border-success/40 bg-success/10">
          <View className="flex-row items-start gap-2.5">
            <CheckCircle2 size={20} color="#34d399" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-success">"{queuedTitle}" en cola</Text>
              <Text className="mt-1 text-xs leading-5 text-white/90">
                Canción en cola. Puedes bloquear el celular: te avisaremos con una notificación push cuando esté lista.
              </Text>
            </View>
          </View>
          <Button
            label="Ir a Biblioteca"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/(tabs)/library' as never)}
          />
        </Card>
      ) : null}

      <Input label="Título" placeholder="Ej. Noche de Verano" value={title} onChangeText={setTitle} maxLength={100} />

      <Input
        label="Descripción y estilo musical"
        placeholder="Reggaetón melódico de verano con guitarra acústica y ritmo bailable"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={500}
      />

      <Card className="flex-row items-center justify-between py-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-white">Solo instrumental</Text>
          <Text className="text-xs text-muted">Genera música sin voz ni letra cantada</Text>
        </View>
        <Switch
          value={instrumental}
          onValueChange={setInstrumental}
          trackColor={{ false: '#334155', true: '#d97745' }}
          thumbColor="#ffffff"
        />
      </Card>

      <ChipGroup label="Idioma" options={LANGUAGES} value={language} onChange={setLanguage} />
      {!instrumental ? (
        <ChipGroup label="Tipo de voz" options={VOCALS} value={vocalType} onChange={setVocalType} />
      ) : null}
      <ChipGroup label="Duración" options={DURATIONS} value={duration} onChange={setDuration} />

      {error ? (
        <View className="rounded-xl border border-danger/40 bg-danger/10 p-3">
          <Text className="text-xs text-danger">{error}</Text>
        </View>
      ) : null}

      <Button
        label="Generar canción"
        variant="primary"
        size="lg"
        fullWidth
        costCredits={1}
        loading={submitting}
        leftIcon={<Sparkles size={18} color="#000000" />}
        onPress={() => void handleSubmit()}
      />
    </View>
  );
}
