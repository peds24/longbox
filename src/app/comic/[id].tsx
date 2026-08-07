import { Image } from 'expo-image';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  deleteComic,
  getComic,
  logComicAsRead,
  markAsRead,
  markAsReading,
  updateComicToNextIssue,
} from '@/db/repository';
import { useTheme } from '@/hooks/use-theme';
import { getNextIssue, NoSeriesLinkError } from '@/services/comics';
import type { TrackedComic } from '@/types/comic';

export default function ComicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [comic, setComic] = useState<TrackedComic | null>(null);
  const [loading, setLoading] = useState(true);
  const [incrementing, setIncrementing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const row = await getComic(db, id);
    setComic(row);
    setLoading(false);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleIncrement() {
    if (!comic) return;
    setIncrementing(true);
    setStatusMessage(null);
    try {
      const next = await getNextIssue(comic);
      if (!next) {
        setStatusMessage('No newer issue yet — you’re caught up.');
        return;
      }
      await logComicAsRead(db, comic);
      await updateComicToNextIssue(db, comic.id, next);
      await load();
    } catch (e) {
      if (e instanceof NoSeriesLinkError) {
        setStatusMessage("Can't auto-increment this item (no linked series).");
      } else {
        setStatusMessage(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setIncrementing(false);
    }
  }

  async function handleToggleRead() {
    if (!comic) return;
    if (comic.status === 'reading') {
      await markAsRead(db, comic.id);
      router.back();
    } else {
      await markAsReading(db, comic.id);
      await load();
    }
  }

  async function handleRemove() {
    if (!comic) return;
    await deleteComic(db, comic.id);
    router.back();
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </ThemedView>
    );
  }

  if (!comic) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="default" themeColor="textMuted">
          This comic couldn&apos;t be found — it may have been removed.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: comic.title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={comic.coverImageUrl}
          style={[styles.cover, { borderColor: theme.border }]}
          contentFit="cover"
        />

        <ThemedText type="prompt">~/reading$ cat</ThemedText>
        <View style={styles.titleRow}>
          <ThemedText type="subtitle" style={styles.title}>
            {comic.title}
          </ThemedText>
          {comic.type === 'issue' && comic.issueNumber && (
            <ThemedText type="default" style={{ color: theme.accent }}>
              [#{comic.issueNumber}]
            </ThemedText>
          )}
        </View>
        {comic.author && (
          <ThemedText type="default" themeColor="textMuted">
            {comic.author}
          </ThemedText>
        )}
        {comic.releaseDate && (
          <ThemedText type="small" themeColor="textMuted">
            Released {comic.releaseDate}
          </ThemedText>
        )}

        {comic.type === 'issue' && comic.status === 'reading' && (
          <View style={styles.section}>
            <TerminalButton
              label="Increment to Next Issue"
              variant="solid"
              fullWidth
              loading={incrementing}
              onPress={handleIncrement}
            />
            {statusMessage && (
              <ThemedText type="small" themeColor="textMuted" style={styles.statusMessage}>
                {statusMessage}
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.section}>
          <TerminalButton
            label={comic.status === 'reading' ? 'Mark as Read' : 'Move back to Current Reading'}
            fullWidth
            onPress={handleToggleRead}
          />
        </View>

        <View style={styles.section}>
          <TerminalButton label="Remove" variant="ghost" fullWidth onPress={handleRemove} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cover: {
    width: 160,
    height: 240,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  title: {
    flexShrink: 1,
  },
  section: {
    marginTop: Spacing.three,
  },
  statusMessage: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
