import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useComicsList } from '@/hooks/use-comics';
import { useTheme } from '@/hooks/use-theme';
import type { TrackedComic } from '@/types/comic';

type SortMode = 'recent' | 'alphabetical';

/**
 * Metron-sourced issues share a stable metronSeriesId across issues of the same series.
 * TPBs (OpenLibrary, no series metadata) fall back to their own title — each one is
 * effectively its own series, which is the correct grouping for a one-off collected edition.
 */
function seriesKey(comic: TrackedComic): string {
  return comic.metronSeriesId ?? `title:${comic.seriesTitle ?? comic.title}`;
}

function seriesName(comic: TrackedComic): string {
  return comic.seriesTitle ?? comic.title;
}

export default function ComicsReadScreen() {
  const { comics, loading, error, refetch } = useComicsList('read');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const theme = useTheme();

  const seriesOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const comic of comics) {
      const key = seriesKey(comic);
      if (!byKey.has(key)) byKey.set(key, seriesName(comic));
    }
    return Array.from(byKey.entries())
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [comics]);

  const visibleComics = useMemo(() => {
    let filtered = selectedSeries ? comics.filter((c) => seriesKey(c) === selectedSeries) : comics;

    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      filtered = filtered.filter((c) =>
        [c.title, c.seriesTitle, c.author].some((field) => field?.toLowerCase().includes(trimmed))
      );
    }

    if (sortMode === 'alphabetical') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [comics, query, sortMode, selectedSeries]);

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

          {seriesOptions.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seriesRow}>
              <Pressable
                onPress={() => setSelectedSeries(null)}
                style={[
                  styles.sortChip,
                  { backgroundColor: selectedSeries === null ? theme.backgroundSelected : theme.backgroundElement },
                ]}>
                <ThemedText type="smallBold">All Series</ThemedText>
              </Pressable>
              {seriesOptions.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setSelectedSeries(option.key)}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor:
                        selectedSeries === option.key ? theme.backgroundSelected : theme.backgroundElement,
                    },
                  ]}>
                  <ThemedText type="smallBold">{option.name}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
              No comics match the current filters.
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
  seriesRow: {
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
