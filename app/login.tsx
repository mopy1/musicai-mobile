import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellRing } from 'lucide-react-native';

import { Card } from '@/components/ui';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="px-6 py-8"
        >
          <View className="items-center pb-7">
            <View className="mb-5 h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-primary/35 bg-card">
              <Image
                source={require('../assets/images/icon.png')}
                style={{ width: 88, height: 88 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-center text-3xl font-bold tracking-tight text-white">
              Bienvenido a MusicAI
            </Text>
            <Text className="mt-2 max-w-[300px] text-center text-sm leading-5 text-muted">
              Inicia sesión para recibir notificaciones push y escuchar tus creaciones
            </Text>
          </View>

          <Card className="border-borderStrong/80 bg-card/95 p-5">
            <LoginForm />
          </Card>

          <View className="mt-6 flex-row items-center justify-center gap-2.5 px-3">
            <BellRing size={15} color="#d97745" />
            <Text className="flex-1 text-xs leading-4 text-muted">
              Al entrar activaremos las notificaciones push en tu teléfono para avisarte cuando tus
              canciones y videos estén listos.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
