import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Coins, Music, Sparkles } from 'lucide-react-native';

import { Badge, Button, Card } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';

export function CreditsHeroCard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const balance = useAuthStore((s) => s.balance);
  const planName = useAuthStore((s) => s.planName);

  const firstName = user?.full_name?.trim().split(/\s+/)[0] || 'Creador';

  return (
    <Card className="border-primary/30 bg-surface">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-medium uppercase tracking-wider text-primary">
            Estudio MusicAI
          </Text>
          <Text className="mt-0.5 text-xl font-bold text-white" numberOfLines={1}>
            Hola, {firstName}
          </Text>
        </View>

        <View className="items-end gap-1.5">
          <View className="flex-row items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1">
            <Coins size={13} color="#d97745" />
            <Text className="text-xs font-bold text-primary">{balance} créd.</Text>
          </View>
          <Badge label={planName || 'Plan gratuito'} tone="neutral" />
        </View>
      </View>

      <View className="mt-4 flex-row gap-2.5">
        <Button
          label="Crear canción"
          variant="primary"
          size="sm"
          leftIcon={<Music size={15} color="#000000" />}
          onPress={() => router.push('/(tabs)/create' as never)}
          className="flex-1"
        />
        <Button
          label="Cambiar caras"
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles size={15} color="#d97745" />}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/create',
              params: { mode: 'faceswap' },
            } as never)
          }
          className="flex-1"
        />
      </View>
    </Card>
  );
}
