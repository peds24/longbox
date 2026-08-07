import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useComicsList } from '@/hooks/use-comics';
import { useTheme } from '@/hooks/use-theme';

type SortMode = 'recent' | 'alphabetical';

export default function ComicsReadScreen() {
  const { comics, loading, error, refetch } = useComicsList('read');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const theme = useTheme();

  const visibleComics = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? comics.filter((c) =>
          [c.title, c.seriesTitle, c.author].some((field) => field?.toLowerCase().includes(trimmed))
        )
      : comics;

    if (sortMode === 'alphabetical') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [comics, query, sortMode]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Comics Read</ThemedText>
        </View>

        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search title, series, or author"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
          <View style={styles.sortRow}>
            <Pressable
              onPress={() => setSortMode('recent')}
              style={[
                styles.sortChip,
                { backgroundColor: sortMode === 'recent' ? theme.backgroundSelected : theme.backgroundElement },
              ]}>
              <ThemedText type="smallBold">Recent</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setSortMode('alphabetical')}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortMode === 'alphabetical' ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}>
              <ThemedText type="smallBold">A–Z</ThemedText>
            </Pressable>
          </View>
        </View>

        {error && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load your comics: {error}
          </ThemedText>
        )}

        {!loading && !error && comics.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
              Nothing marked as read yet.
            </ThemedText>
          </View>
        )}

        {!loading && !error && comics.length > 0 && visibleComics.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
              No comics match &quot;{query.trim()}&quot;.
            </ThemedText>
          </View>
        )}

        <FlatList
          data={visibleComics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ComicCard comic={item} />}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={loading}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  controls: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sortChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  empty: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
