import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui';
import { LibraryFaceswapList } from '@/features/faceswap/LibraryFaceswapList';
import { LibrarySongsList } from '@/features/songs/LibrarySongsList';
import { cn } from '@/lib/format';

type LibraryTab = 'songs' | 'faceswap';

export default function LibraryScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    params.tab === 'faceswap' ? 'faceswap' : 'songs',
  );

  useEffect(() => {
    if (params.tab === 'faceswap') setActiveTab('faceswap');
    else if (params.tab === 'songs') setActiveTab('songs');
  }, [params.tab]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-night px-4">
      <ScreenHeader
        title="Mi Biblioteca"
        subtitle="Tus canciones y videos generados en MusicAI"
      />

      <View className="mb-4 flex-row rounded-2xl border border-borderSubtle bg-surface p-1">
        <Pressable
          onPress={() => setActiveTab('songs')}
          className={cn(
            'flex-1 items-center rounded-xl py-2.5',
            activeTab === 'songs' ? 'bg-primary' : 'bg-transparent',
          )}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              activeTab === 'songs' ? 'text-black' : 'text-muted',
            )}
          >
            Canciones
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('faceswap')}
          className={cn(
            'flex-1 items-center rounded-xl py-2.5',
            activeTab === 'faceswap' ? 'bg-primary' : 'bg-transparent',
          )}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              activeTab === 'faceswap' ? 'text-black' : 'text-muted',
            )}
          >
            Videos Caras
          </Text>
        </Pressable>
      </View>

      <View className="flex-1">
        {activeTab === 'songs' ? <LibrarySongsList /> : <LibraryFaceswapList />}
      </View>
    </SafeAreaView>
  );
}
