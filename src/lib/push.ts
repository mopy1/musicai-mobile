import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export type PushStatus = 'idle' | 'active' | 'denied' | 'unavailable' | 'error';

export interface PushRegistrationResult {
  status: Exclude<PushStatus, 'idle'>;
  token?: string;
  message?: string;
}

const ANDROID_CHANNEL_ID = 'musicai_default';

// Permite mostrar banners y sonido incluso cuando la app está en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerNativeFcmToken(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'MusicAI',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#d97745',
    }).catch(() => undefined);
  }

  try {
    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      return {
        status: 'denied',
        message: 'Activa los permisos de notificaciones en Android para recibir avisos.',
      };
    }
  } catch {
    return {
      status: 'unavailable',
      message: 'No se pudo consultar el permiso de notificaciones en este dispositivo.',
    };
  }

  let token: string | undefined;
  try {
    const devicePush = await Notifications.getDevicePushTokenAsync();
    token = typeof devicePush.data === 'string' ? devicePush.data : undefined;
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : '';
    const msg =
      rawMsg.includes('FirebaseApp') || rawMsg.includes('googleServicesFile')
        ? 'Falta compilar el APK con google-services.json para activar las notificaciones push FCM.'
        : rawMsg || 'Push nativo FCM no disponible en esta compilación.';
    return {
      status: 'unavailable',
      message: msg,
    };
  }

  if (!token) {
    return {
      status: 'unavailable',
      message: 'No se obtuvo un token FCM válido del dispositivo.',
    };
  }

  try {
    await apiClient.post(ENDPOINTS.auth.fcmToken, { fcm_token: token });
    return {
      status: 'active',
      token,
      message: 'Notificaciones push activas en este dispositivo.',
    };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'No se pudo registrar el token en el servidor.';
    return {
      status: 'error',
      token,
      message: msg,
    };
  }
}

export interface NotificationPayloadData {
  type?: string;
  reference_id?: string | number | null;
  song_id?: string | number | null;
}

export function resolveNotificationRoute(data?: NotificationPayloadData | null): string {
  if (!data) return '/(tabs)/notifications';

  const type = typeof data.type === 'string' ? data.type : '';
  const refId = data.reference_id != null && String(data.reference_id).trim() !== ''
    ? String(data.reference_id)
    : data.song_id != null && String(data.song_id).trim() !== ''
      ? String(data.song_id)
      : '';

  if ((type === 'song_ready' || type === 'song_published') && refId) {
    return `/song/${refId}`;
  }

  if (type === 'faceswap_ready' && refId) {
    return `/faceswap/${refId}`;
  }

  return '/(tabs)/notifications';
}
