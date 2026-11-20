import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui';
import { CreateFaceswapForm } from '@/features/faceswap/CreateFaceswapForm';
import { CreateSongForm } from '@/features/songs/CreateSongForm';
import { cn } from '@/lib/format';

type CreateMode = 'song' | 'faceswap';

export default function CreateScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<CreateMode>(
    params.mode === 'faceswap' ? 'faceswap' : 'song',
  );

  useEffect(() => {
    if (params.mode === 'faceswap') setMode('faceswap');
    else if (params.mode === 'song') setMode('song');
  }, [params.mode]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-night">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="Estudio IA"
            subtitle="Crea canciones originales o videos con tu rostro"
          />

          <View className="mb-5 flex-row rounded-2xl border border-borderSubtle bg-surface p-1">
            <Pressable
              onPress={() => setMode('song')}
              className={cn(
                'flex-1 items-center rounded-xl py-2.5',
                mode === 'song' ? 'bg-primary' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  mode === 'song' ? 'text-black' : 'text-muted',
                )}
              >
                Canción · 1 cr
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('faceswap')}
              className={cn(
                'flex-1 items-center rounded-xl py-2.5',
                mode === 'faceswap' ? 'bg-primary' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  mode === 'faceswap' ? 'text-black' : 'text-muted',
                )}
              >
                Cambiar caras · 3 cr
              </Text>
            </Pressable>
          </View>

          {mode === 'song' ? <CreateSongForm /> : <CreateFaceswapForm />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
