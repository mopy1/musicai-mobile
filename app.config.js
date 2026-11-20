const fs = require('fs');
const path = require('path');

const googleServicesPath = path.join(__dirname, 'google-services.json');
const hasGoogleServices = fs.existsSync(googleServicesPath);

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'MusicAI',
  slug: 'musicai-mobile',
  version: '1.0.0',
  scheme: 'musicai',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#070b14',
  icon: './assets/images/icon.png',
  android: {
    package: 'com.musicai.app',
    adaptiveIcon: {
      backgroundColor: '#070b14',
      foregroundImage: './assets/images/adaptive-icon.png',
    },
    ...(hasGoogleServices ? { googleServicesFile: './google-services.json' } : {}),
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#070b14',
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#d97745',
      },
    ],
    'expo-audio',
    'expo-video',
    [
      'expo-image-picker',
      {
        photosPermission: 'Permitir elegir fotos para Cambiar caras en MusicAI',
        cameraPermission: 'Permitir usar la cámara para tomar selfies en Cambiar caras',
      },
    ],
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: false,
        },
      },
    ],
    './plugins/with-gradle-ram',
  ],
};
