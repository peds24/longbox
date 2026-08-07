import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { resolveFirstIssue, searchByTitle, type MetronSeriesSummary } from '@/services/comics';
import { usePendingMatch } from '@/state/pending-match';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MetronSeriesSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const { setPending } = usePendingMatch();

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const series = await searchByTitle(query.trim());
      setResults(series);
      setHasSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSearching(false);
    }
  }

  async function pickSeries(series: MetronSeriesSummary) {
    setResolvingId(series.id);
    setError(null);
    try {
      const match = await resolveFirstIssue(series.id);
      setPending([match]);
      router.push('/add/confirm');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="prompt" style={styles.prompt}>
          ~/add/search$
        </ThemedText>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
            placeholder="series title, e.g. Batman"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            returnKeyType="search"
          />
          <TerminalButton label="Search" variant="solid" onPress={runSearch} />
        </View>

        {searching && <ActivityIndicator style={styles.spinner} color={theme.accent} />}

        {error && (
          <ThemedText type="small" themeColor="textMuted" style={styles.message}>
            {error}
          </ThemedText>
        )}

        {!searching && !error && hasSearched && results.length === 0 && (
          <ThemedText type="small" themeColor="textMuted" style={styles.message}>
            No series found for &quot;{query.trim()}&quot;.
          </ThemedText>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => pickSeries(item)} disabled={resolvingId !== null}>
              <ThemedView type="surface" style={[styles.resultRow, { borderColor: theme.border }]}>
                <ThemedText type="default" style={styles.resultText}>
                  {item.series}
                </ThemedText>
                {resolvingId === item.id && <ActivityIndicator color={theme.accent} />}
              </ThemedView>
            </Pressable>
          )}
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
  prompt: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  spinner: {
    marginTop: Spacing.three,
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderWidth: 1,
  },
  resultText: {
    flex: 1,
  },
});
