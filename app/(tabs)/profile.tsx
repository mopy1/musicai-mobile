import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { CheckCircle2, Coins, LogOut, Save, Shield, User } from 'lucide-react-native';

import { Badge, Button, Card, Input, ScreenHeader } from '@/components/ui';
import { PushStatusCard } from '@/features/profile/PushStatusCard';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { usePlayerStore } from '@/store/player.store';

function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || 'M';
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const balance = useAuthStore((s) => s.balance);
  const planName = useAuthStore((s) => s.planName);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const refreshBalance = useAuthStore((s) => s.refreshBalance);
  const logout = useAuthStore((s) => s.logout);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? '');
  }, [user?.full_name]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshProfile(), refreshBalance()]);
    setRefreshing(false);
  };

  const handleSaveName = async () => {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setSaveError('Escribe un nombre de al menos 2 caracteres.');
      setSaveSuccess(null);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await apiClient.patch(ENDPOINTS.auth.me, { full_name: trimmed });
      await refreshProfile();
      setSaveSuccess('Nombre actualizado correctamente.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo actualizar tu nombre.');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setLoggingOut(true);
            try {
              usePlayerStore.getState().clear();
              useNotificationsStore.getState().reset();
              await logout();
            } finally {
              setLoggingOut(false);
            }
          })();
        },
      },
    ]);
  };

  const initials = getInitials(user?.full_name, user?.email);

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: hasMiniPlayer ? 104 : 28,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#d97745"
            colors={['#d97745']}
          />
        }
      >
        <ScreenHeader title="Perfil" subtitle="Tu cuenta y estado de notificaciones" />

        <Card className="gap-4">
          <View className="flex-row items-center gap-3.5">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-primary/15">
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={{ width: 64, height: 64 }} contentFit="cover" />
              ) : (
                <Text className="text-xl font-bold text-primary">{initials}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white" numberOfLines={1}>
                {user?.full_name || 'Usuario MusicAI'}
              </Text>
              <Text className="text-xs text-muted" numberOfLines={1}>
                {user?.email || 'Sin correo'}
              </Text>
              <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
                <Badge label={planName || 'Plan gratuito'} tone="primary" />
                {user?.role ? (
                  <View className="flex-row items-center gap-1 rounded-full border border-borderStrong bg-surface px-2.5 py-0.5">
                    <Shield size={11} color="#94a3b8" />
                    <Text className="text-[11px] font-semibold capitalize text-muted">{user.role}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between rounded-xl border border-borderSubtle bg-surface px-3.5 py-2.5">
            <View className="flex-row items-center gap-2">
              <Coins size={16} color="#d97745" />
              <Text className="text-xs font-medium text-muted">Saldo disponible</Text>
            </View>
            <Text className="text-sm font-bold text-primary">{balance} créditos</Text>
          </View>

          <View className="gap-2.5 border-t border-borderSubtle pt-3">
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (saveError) setSaveError(null);
                if (saveSuccess) setSaveSuccess(null);
              }}
              error={saveError}
              editable={!saving}
              leftIcon={<User size={16} color="#94a3b8" />}
            />
            {saveSuccess ? (
              <View className="flex-row items-center gap-1.5">
                <CheckCircle2 size={14} color="#34d399" />
                <Text className="text-xs text-success">{saveSuccess}</Text>
              </View>
            ) : null}
            <Button
              label="Guardar nombre"
              variant="secondary"
              size="sm"
              loading={saving}
              disabled={fullName.trim() === (user?.full_name ?? '').trim()}
              leftIcon={<Save size={14} color="#ffffff" />}
              onPress={() => void handleSaveName()}
            />
          </View>
        </Card>

        <PushStatusCard />

        <Button
          label="Cerrar sesión"
          variant="danger"
          size="md"
          fullWidth
          loading={loggingOut}
          leftIcon={<LogOut size={16} color="#fb7185" />}
          onPress={confirmLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
