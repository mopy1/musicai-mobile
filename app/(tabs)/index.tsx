import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Music, Search, X } from 'lucide-react-native';

import { EmptyState, Input, ScreenHeader } from '@/components/ui';
import { fetchCommunityFeed, fetchTrending, toggleCommunityLike } from '@/features/community/api';
import { CreditsHeroCard } from '@/features/community/CreditsHeroCard';
import { SongRowCard } from '@/features/community/SongRowCard';
import { TrendingRail } from '@/features/community/TrendingRail';
import { useAuthStore } from '@/store/auth.store';
import { usePlayerStore } from '@/store/player.store';
import type { CommunitySong } from '@/types/api';

function patchLike(list: CommunitySong[], id: string, liked: boolean, count: number) {
  return list.map((item) =>
    item.id === id ? { ...item, is_liked: liked, like_count: count } : item,
  );
}

export default function CommunityHomeScreen() {
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));
  const refreshBalance = useAuthStore((s) => s.refreshBalance);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [trending, setTrending] = useState<CommunitySong[]>([]);
  const [songs, setSongs] = useState<CommunitySong[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadFeed = useCallback(async (query: string, targetPage = 1, append = false) => {
    try {
      setError(null);
      const data = await fetchCommunityFeed({ search: query, page: targetPage });
      setSongs((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page);
      setHasNext(data.has_next);
    } catch (err) {
      if (!append) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la comunidad.');
      }
    }
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      setTrending(await fetchTrending());
    } catch {
      // Mantiene el feed principal operativo aunque fallen las tendencias.
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      await Promise.all([
        loadFeed(debouncedSearch, 1, false),
        debouncedSearch ? Promise.resolve() : loadTrending(),
      ]);
      if (active) setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, [debouncedSearch, loadFeed, loadTrending]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([loadFeed(debouncedSearch, 1, false), loadTrending(), refreshBalance()]);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasNext || loading || loadingMore) return;
    setLoadingMore(true);
    await loadFeed(debouncedSearch, page + 1, true);
    setLoadingMore(false);
  };

  const handleToggleLike = useCallback(async (target: CommunitySong) => {
    const nextLiked = !target.is_liked;
    const nextCount = Math.max(0, target.like_count + (nextLiked ? 1 : -1));
    setSongs((prev) => patchLike(prev, target.id, nextLiked, nextCount));
    setTrending((prev) => patchLike(prev, target.id, nextLiked, nextCount));

    try {
      const res = await toggleCommunityLike(target.id);
      setSongs((prev) => patchLike(prev, target.id, res.liked, res.like_count));
      setTrending((prev) => patchLike(prev, target.id, res.liked, res.like_count));
    } catch {
      setSongs((prev) => patchLike(prev, target.id, target.is_liked, target.like_count));
      setTrending((prev) => patchLike(prev, target.id, target.is_liked, target.like_count));
    }
  }, []);

  const listHeader = (
    <View className="mb-3">
      {!debouncedSearch ? (
        <>
          <CreditsHeroCard />
          <TrendingRail songs={trending} />
        </>
      ) : null}
      <View className="mt-5 flex-row items-center gap-2">
        <Compass size={16} color="#d97745" />
        <Text className="text-base font-bold text-white">
          {debouncedSearch ? `Resultados para "${debouncedSearch}"` : 'Comunidad MusicAI'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <View className="px-4 pt-2">
        <ScreenHeader title="Inicio" subtitle="Descubre y crea música con IA" />
        <Input
          placeholder="Buscar canciones, géneros o artistas..."
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          containerClassName="mb-3"
          leftIcon={<Search size={17} color="#94a3b8" />}
          rightElement={
            searchText.length > 0 ? (
              <Pressable onPress={() => setSearchText('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
                <X size={16} color="#94a3b8" />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SongRowCard song={item} onToggleLike={handleToggleLike} />}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: hasMiniPlayer ? 104 : 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#d97745"
            colors={['#d97745']}
          />
        }
        onEndReached={() => void handleLoadMore()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#d97745" />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="small" color="#d97745" />
              <Text className="mt-2 text-xs text-muted">Cargando canciones...</Text>
            </View>
          ) : (
            <EmptyState
              icon={<Music size={28} color="#64748b" />}
              title={error ? 'No se pudo cargar el feed' : debouncedSearch ? 'Sin coincidencias' : 'Aún no hay canciones públicas'}
              description={error || (debouncedSearch ? 'Prueba con otro título, estilo o creador.' : 'Sé de los primeros en publicar una canción en MusicAI.')}
              actionLabel={debouncedSearch ? 'Limpiar búsqueda' : 'Reintentar'}
              onAction={() => (debouncedSearch ? setSearchText('') : void handleRefresh())}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
