import { useState } from 'react';
import { Text, View } from 'react-native';
import { BellRing, Info, RefreshCw } from 'lucide-react-native';

import { Badge, Button, Card, type BadgeTone } from '@/components/ui';
import type { PushStatus } from '@/lib/push';
import { useAuthStore } from '@/store/auth.store';

const STATUS_META: Record<PushStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Activo (FCM)', tone: 'success' },
  denied: { label: 'Permiso denegado', tone: 'warning' },
  unavailable: { label: 'No disponible', tone: 'neutral' },
  error: { label: 'Error', tone: 'danger' },
  idle: { label: 'No disponible', tone: 'neutral' },
};

function formatTokenPreview(token: string): string {
  if (token.length <= 24) return token;
  return `${token.slice(0, 14)}…${token.slice(-8)}`;
}

export function PushStatusCard() {
  const pushStatus = useAuthStore((s) => s.pushStatus);
  const pushMessage = useAuthStore((s) => s.pushMessage);
  const fcmToken = useAuthStore((s) => s.fcmToken);
  const syncPushToken = useAuthStore((s) => s.syncPushToken);

  const [syncing, setSyncing] = useState(false);

  const statusMeta = STATUS_META[pushStatus] ?? STATUS_META.unavailable;

  const handleResync = async () => {
    setSyncing(true);
    try {
      await syncPushToken();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <BellRing size={17} color="#d97745" />
          <Text className="text-base font-bold text-white">Notificaciones Push</Text>
        </View>
        <Badge label={statusMeta.label} tone={statusMeta.tone} />
      </View>

      {pushMessage ? (
        <Text className="text-xs leading-4 text-muted">{pushMessage}</Text>
      ) : null}

      {fcmToken ? (
        <View className="rounded-xl border border-borderSubtle bg-surface px-3 py-2">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Token FCM registrado
          </Text>
          <Text className="mt-0.5 font-mono text-xs text-white/90" numberOfLines={1}>
            {formatTokenPreview(fcmToken)}
          </Text>
        </View>
      ) : null}

      <Button
        label="Re-sincronizar Push"
        variant="secondary"
        size="sm"
        loading={syncing}
        leftIcon={<RefreshCw size={14} color="#d97745" />}
        onPress={() => void handleResync()}
      />

      <View className="flex-row items-start gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
        <Info size={15} color="#d97745" style={{ marginTop: 1 }} />
        <Text className="flex-1 text-xs leading-4 text-muted">
          En POCO/MIUI activa &apos;Sin restricciones de batería&apos; y &apos;Notificaciones
          flotantes&apos; para recibir avisos con la pantalla bloqueada
        </Text>
      </View>
    </Card>
  );
}
