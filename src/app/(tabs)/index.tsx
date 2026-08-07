import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/comic-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useComicsList } from '@/hooks/use-comics';
import { useTheme } from '@/hooks/use-theme';

export default function CurrentReadingScreen() {
  const { comics, loading, error, refetch } = useComicsList('reading');
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Current Reading</ThemedText>
          <Link href="/add" asChild>
            <Pressable style={StyleSheet.flatten([styles.addButton, { backgroundColor: theme.backgroundElement }])}>
              <ThemedText type="smallBold">+ Add</ThemedText>
            </Pressable>
          </Link>
        </View>

        {error && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load your comics: {error}
          </ThemedText>
        )}

        {!loading && !error && comics.length === 0 && (
          <View style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
              Nothing here yet. Tap + Add to scan or search for a comic.
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
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
