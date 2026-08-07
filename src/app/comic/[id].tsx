import { Image } from 'expo-image';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!comic) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="default" themeColor="textSecondary">
          This comic couldn&apos;t be found — it may have been removed.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: comic.title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={comic.coverImageUrl} style={styles.cover} contentFit="cover" />

        <ThemedText type="subtitle">{comic.title}</ThemedText>
        {comic.author && (
          <ThemedText type="default" themeColor="textSecondary">
            {comic.author}
          </ThemedText>
        )}
        {comic.releaseDate && (
          <ThemedText type="small" themeColor="textSecondary">
            Released {comic.releaseDate}
          </ThemedText>
        )}
        {comic.type === 'issue' && comic.issueNumber && (
          <ThemedText type="default">Issue #{comic.issueNumber}</ThemedText>
        )}

        {comic.type === 'issue' && comic.status === 'reading' && (
          <View style={styles.section}>
            <Pressable
              onPress={handleIncrement}
              disabled={incrementing}
              style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}>
              {incrementing ? (
                <ActivityIndicator />
              ) : (
                <ThemedText type="smallBold">Increment to next issue</ThemedText>
              )}
            </Pressable>
            {statusMessage && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.statusMessage}>
                {statusMessage}
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Pressable
            onPress={handleToggleRead}
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">
              {comic.status === 'reading' ? 'Mark as Read' : 'Move back to Current Reading'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable onPress={handleRemove} style={styles.removeButton}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Remove
            </ThemedText>
          </Pressable>
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
    borderRadius: Spacing.two,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  section: {
    marginTop: Spacing.three,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  statusMessage: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  removeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
