import { useMemo, useState } from 'react';
import { FlatList, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useComicsList } from '@/hooks/use-comics';
import { useTheme } from '@/hooks/use-theme';
import { sortByIssueNumber } from '@/services/comics/issue-number';
import type { TrackedComic } from '@/types/comic';

type SortMode = 'recent' | 'alphabetical' | 'series';

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

interface Section {
  key: string;
  title: string;
  data: TrackedComic[];
}

export default function ComicsReadScreen() {
  const { comics, loading, error, refetch } = useComicsList('read');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(new Set());
  const theme = useTheme();

  const searched = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return comics;
    return comics.filter((c) =>
      [c.title, c.seriesTitle, c.author].some((field) => field?.toLowerCase().includes(trimmed))
    );
  }, [comics, query]);

  const visibleComics = useMemo(() => {
    if (sortMode === 'alphabetical') {
      return [...searched].sort((a, b) => a.title.localeCompare(b.title));
    }
    return searched;
  }, [searched, sortMode]);

  const sections = useMemo<Section[]>(() => {
    const byKey = new Map<string, Section>();
    for (const comic of searched) {
      const key = seriesKey(comic);
      const existing = byKey.get(key);
      if (existing) {
        existing.data.push(comic);
      } else {
        byKey.set(key, { key, title: seriesName(comic), data: [comic] });
      }
    }
    return Array.from(byKey.values())
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((section) => ({
        ...section,
        data: collapsedSeries.has(section.key) ? [] : sortByIssueNumber(section.data, (c) => c.issueNumber),
      }));
  }, [searched, collapsedSeries]);

  function toggleSeries(key: string) {
    setCollapsedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const isGrouped = sortMode === 'series';
  const hasResults = searched.length > 0;

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
            <Pressable
              onPress={() => setSortMode('series')}
              style={[
                styles.sortChip,
                { backgroundColor: isGrouped ? theme.backgroundSelected : theme.backgroundElement },
              ]}>
              <ThemedText type="smallBold">By Series</ThemedText>
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

        {!loading && !error && comics.length > 0 && !hasResults && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
              No comics match &quot;{query.trim()}&quot;.
            </ThemedText>
          </View>
        )}

        {isGrouped ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ComicCard comic={item} />}
            renderSectionHeader={({ section }) => {
              const collapsed = collapsedSeries.has(section.key);
              return (
                <Pressable onPress={() => toggleSeries(section.key)} style={styles.sectionHeader}>
                  <ThemedText type="small" style={styles.sectionArrow}>
                    {collapsed ? '▸' : '▾'}
                  </ThemedText>
                  <ThemedText type="smallBold">{section.title}</ThemedText>
                </Pressable>
              );
            }}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            onRefresh={refetch}
            refreshing={loading}
          />
        ) : (
          <FlatList
            data={visibleComics}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ComicCard comic={item} />}
            contentContainerStyle={styles.list}
            onRefresh={refetch}
            refreshing={loading}
          />
        )}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  sectionArrow: {
    width: Spacing.four,
    fontSize: 22,
    lineHeight: 22,
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
