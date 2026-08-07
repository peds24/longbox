import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useComicsList } from '@/hooks/use-comics';

export default function CurrentReadingScreen() {
  const { comics, loading, error, refetch } = useComicsList('reading');
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View>
            <ThemedText type="prompt">~/reading$</ThemedText>
            <ThemedText type="subtitle">CURRENT</ThemedText>
          </View>
          <TerminalButton label="+ Add" variant="solid" size="sm" onPress={() => router.push('/add')} />
        </View>

        {error && (
          <ThemedText type="small" themeColor="textMuted" style={styles.message}>
            Couldn&apos;t load your comics: {error}
          </ThemedText>
        )}

        {!loading && !error && comics.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textMuted" style={styles.message}>
              NOTHING IN HAND — start a comic from your backlog, or tap + Add to file a new one.
            </ThemedText>
          </View>
        )}

        <FlatList
          data={comics}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
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
