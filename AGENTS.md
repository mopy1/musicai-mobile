# MusicAI Mobile — Mapa del Repositorio

Aplicación móvil nativa para Android/iOS de **MusicAI** construida con **Expo SDK 58**, **Expo Router**, **NativeWind v4** y **Zustand**.

---

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | Expo `~58.0.26`, React `19.3.0`, React Native `0.88.1` |
| Navegación | `expo-router` `~58.0.32` (file-based routing + Tabs + Stack) |
| Estilos | NativeWind `4.2.7` + Tailwind CSS `3.4.19` (tema oscuro `#070b14`, acento `#d97745`) |
| Estado | Zustand `5.1.0` (`auth`, `player`, `notifications`) |
| Audio / Video | `expo-audio` `~58.0.12`, `expo-video` `~58.0.14` |
| Archivos y Media | `expo-image`, `expo-image-picker`, `expo-file-system` (API OOP `File`/`Paths`), `expo-sharing`, `expo-haptics` |
| Seguridad y Push | `expo-secure-store`, `expo-notifications` (FCM nativo con `google-services.json`) |

---

## Árbol de Carpetas

```text
musicai-mobile/
├── app.config.js                 # Config CNG Expo (package com.musicai.app, plugins, FCM)
├── plugins/
│   └── with-gradle-ram.js        # Limita RAM de Gradle para compilar en WSL (8 GB RAM)
├── assets/images/                # Íconos, splash e ícono de notificaciones
├── app/
│   ├── _layout.tsx               # Stack raíz, hidratación de sesión y deep-links push
│   ├── login.tsx                 # Inicio de sesión y registro
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Navegación de pestañas + MiniPlayer persistente
│   │   ├── index.tsx             # Explorar comunidad (feed, trending, likes, stats)
│   │   ├── create.tsx            # Estudio IA: Canción (1 cr) | Cambiar caras (3 cr)
│   │   ├── library.tsx           # Mi Biblioteca: Canciones | Videos Caras
│   │   ├── notifications.tsx     # Centro de notificaciones y lectura
│   │   └── profile.tsx           # Perfil, créditos, estado push FCM y cerrar sesión
│   ├── song/[id].tsx             # Detalle de canción, reproducción, compartir y publicar
│   └── faceswap/[id].tsx         # Progreso en vivo, video MP4 nativo y compartir/guardar
└── src/
    ├── components/
    │   ├── MiniPlayer.tsx        # Reproductor persistente con expo-audio
    │   └── ui/                   # Badge, Button, Card, EmptyState, Input, ScreenHeader
    ├── features/
    │   ├── songs/                # api.ts, LibrarySongsList.tsx, CreateSongForm.tsx
    │   └── faceswap/             # api.ts, LibraryFaceswapList.tsx, CreateFaceswapForm.tsx
    ├── lib/                      # api-client.ts, endpoints.ts, format.ts, push.ts, token-storage.ts
    ├── store/                    # auth.store.ts, player.store.ts, notifications.store.ts
    └── types/                    # api.ts, faceswap.ts
```

---

## Mapa de Pantallas → Endpoints Backend

Base URL por defecto: `https://musicai-sw.duckdns.org/api` (configurable vía `EXPO_PUBLIC_API_URL`).

| Pantalla / Módulo | Rutas REST utilizadas |
| --- | --- |
| `app/login.tsx` | `POST /auth/login/`, `POST /auth/register/`, `GET /auth/me/`, `GET /credits/balance/` |
| `app/(tabs)/index.tsx` | `GET /community/feed/`, `GET /community/trending/`, `GET /community/stats/`, `POST /community/songs/{id}/like/` |
| `app/(tabs)/create.tsx` → `CreateSongForm` | `POST /songs/generate/`, `GET /credits/balance/` |
| `app/(tabs)/create.tsx` → `CreateFaceswapForm` | `GET /faceswap/templates/`, `POST /faceswap/jobs/` (multipart `photo`, `template_id`, `consent`), `GET /credits/balance/` |
| `app/(tabs)/library.tsx` → `LibrarySongsList` | `GET /songs/library/`, `GET /songs/jobs/?active=1` |
| `app/(tabs)/library.tsx` → `LibraryFaceswapList` | `GET /faceswap/jobs/` (polling ligero cada 5 s si hay jobs activos) |
| `app/song/[id].tsx` | `GET /songs/{id}/`, `PATCH /songs/{id}/`, `GET /songs/{id}/play-url/`, `GET /songs/{id}/thumbnail-url/` |
| `app/faceswap/[id].tsx` | `GET /faceswap/jobs/{id}/`, `GET /faceswap/jobs/{id}/result-url/` |
| `app/(tabs)/notifications.tsx` | `GET /notifications/`, `POST /notifications/{id}/read/`, `POST /notifications/read-all/` |
| `app/(tabs)/profile.tsx` | `GET /auth/me/`, `GET /credits/balance/`, `POST /auth/fcm-token/`, `POST /auth/logout/` |
| `MiniPlayer.tsx` | `GET /songs/{id}/play-url/`, `POST /community/songs/{id}/play/` |

---

## Push Notifications con `google-services.json` (Firebase FCM)

1. Crea o abre el proyecto Firebase con la app Android de paquete **`com.musicai.app`**.
2. Descarga `google-services.json` y colócalo en la raíz: `/home/lmc/projects/musicai-mobile/google-services.json`.
3. `app.config.js` detecta automáticamente el archivo (`fs.existsSync`) y lo registra en `android.googleServicesFile`.
4. Al iniciar sesión, `useAuthStore.syncPushToken()` obtiene el token FCM nativo (`Notifications.getDevicePushTokenAsync()`) y lo registra en `POST /api/auth/fcm-token/`.

---

## Compilación de APK en WSL (RAM Optimizada) e Instalación por ADB Inalámbrico

El plugin `plugins/with-gradle-ram.js` inyecta automáticamente límites seguros en `android/gradle.properties` (`-Xmx2560m`, `org.gradle.workers.max=2`, `org.gradle.daemon=false`, `reactNativeArchitectures=arm64-v8a`) durante `expo prebuild` para evitar OOM en WSL con 8 GB de RAM.

```bash
# 1. Generar proyecto nativo Android limpio con límites de RAM
npx expo prebuild --platform android --clean

# 2. Compilar APK release (arm64-v8a)
cd android && ./gradlew assembleRelease --no-daemon

# 3. Conectar celular vía ADB inalámbrico (nunca USB directo en WSL)
adb connect <IP_CELULAR>:<PUERTO_DEPURACION>
adb devices

# 4. Instalar el APK generado
adb install -r app/build/outputs/apk/release/app-release.apk
```
