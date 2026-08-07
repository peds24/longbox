import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { STATUS_LABELS, STATUS_ORDER } from '@/constants/status';
import { Spacing } from '@/constants/theme';
import { useComicsList, type ComicsFilter } from '@/hooks/use-comics';
import { useTheme } from '@/hooks/use-theme';
import { sortByIssueNumber } from '@/services/comics/issue-number';
import type { TrackedComic } from '@/types/comic';

type SortMode = 'recent' | 'alphabetical' | 'series';

const FILTERS: { value: ComicsFilter; label: string }[] = [
  { value: 'all', label: 'ALL' },
  ...STATUS_ORDER.map((status) => ({ value: status as ComicsFilter, label: STATUS_LABELS[status] })),
];

function isComicsFilter(value: unknown): value is ComicsFilter {
  return FILTERS.some((f) => f.value === value);
}

const EMPTY_MESSAGES: Record<ComicsFilter, string> = {
  all: 'BOX EMPTY — tap + Add on the Reading tab to file your first comic.',
  backlog: 'BACKLOG EMPTY — newly added comics start here.',
  reading: 'NOTHING IN HAND — start a comic from your backlog.',
  read: 'NOTHING FILED YET — comics you mark as read land here.',
};

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

export default function ComicBoxScreen() {
  // The active filter lives in the route params rather than in local state so other screens
  // can land here on a specific one — the add flow returns to `?filter=backlog` so the comic
  // you just filed is the one you see. The tab keeps its params between visits, so switching
  // tabs still comes back to whichever filter you left it on.
  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();
  const filter: ComicsFilter = isComicsFilter(filterParam) ? filterParam : 'all';
  const { comics, loading, error, refetch } = useComicsList(filter);
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

  function chipStyle(active: boolean) {
    return [styles.chip, { borderColor: active ? theme.accent : theme.border }];
  }

  function chipTextColor(active: boolean) {
    return { color: active ? theme.accent : theme.textMuted };
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="prompt">~/box$</ThemedText>
          <ThemedText type="subtitle">COMIC BOX</ThemedText>
        </View>

        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="search title, series, author"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {FILTERS.map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => router.setParams({ filter: value })}
                style={chipStyle(filter === value)}>
                <ThemedText type="smallBold" style={chipTextColor(filter === value)}>
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.chipRow}>
            <Pressable onPress={() => setSortMode('recent')} style={chipStyle(sortMode === 'recent')}>
              <ThemedText type="smallBold" style={chipTextColor(sortMode === 'recent')}>
                RECENT
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setSortMode('alphabetical')} style={chipStyle(sortMode === 'alphabetical')}>
              <ThemedText type="smallBold" style={chipTextColor(sortMode === 'alphabetical')}>
                A–Z
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setSortMode('series')} style={chipStyle(isGrouped)}>
              <ThemedText type="smallBold" style={chipTextColor(isGrouped)}>
                BY SERIES
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {error && (
          <ThemedText type="small" themeColor="textMuted" style={styles.message}>
            Couldn&apos;t load your comics: {error}
          </ThemedText>
        )}

        {!loading && !error && comics.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textMuted" style={styles.message}>
              {EMPTY_MESSAGES[filter]}
            </ThemedText>
          </View>
        )}

        {!loading && !error && comics.length > 0 && !hasResults && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textMuted" style={styles.message}>
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
                  <ThemedText type="small" style={[styles.sectionArrow, { color: theme.accent }]}>
                    {collapsed ? '▸' : '▾'}
                  </ThemedText>
                  <ThemedText type="smallBold">{section.title.toUpperCase()}</ThemedText>
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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  controls: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderWidth: 1,
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
    fontSize: 26,
    lineHeight: 26,
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
