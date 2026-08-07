import { Image } from 'expo-image';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { STATUS_LABELS, statusColor } from '@/constants/status';
import { Spacing } from '@/constants/theme';
import { deleteComic, getComic, insertComic, setStatus } from '@/db/repository';
import { useTheme } from '@/hooks/use-theme';
import { getNextIssue, NoSeriesLinkError, type ComicMatch } from '@/services/comics';
import type { ComicStatus, TrackedComic } from '@/types/comic';

type NextIssueCheck =
  | { status: 'found'; match: ComicMatch }
  | { status: 'none' }
  | { status: 'unsupported' };

async function resolveNextIssue(comic: TrackedComic): Promise<NextIssueCheck> {
  try {
    const next = await getNextIssue(comic);
    return next ? { status: 'found', match: next } : { status: 'none' };
  } catch (e) {
    if (e instanceof NoSeriesLinkError) return { status: 'unsupported' };
    throw e;
  }
}

function noNextIssueMessage(status: 'none' | 'unsupported') {
  return status === 'none'
    ? 'No newer issue yet — you’re caught up.'
    : "Can't check for new issues (no linked series).";
}

export default function ComicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [comic, setComic] = useState<TrackedComic | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

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

  async function handleMarkAsRead() {
    if (!comic) return;

    if (comic.type !== 'issue') {
      await setStatus(db, comic.id, 'read');
      router.back();
      return;
    }

    setChecking(true);
    try {
      const check = await resolveNextIssue(comic);

      if (check.status === 'found') {
        Alert.alert(`New issue: ${check.match.title}`, 'Add it to your backlog?', [
          {
            text: 'No',
            style: 'cancel',
            onPress: async () => {
              await setStatus(db, comic.id, 'read');
              router.back();
            },
          },
          {
            text: 'Yes',
            onPress: async () => {
              await setStatus(db, comic.id, 'read');
              await insertComic(db, check.match);
              router.back();
            },
          },
        ]);
        return;
      }

      Alert.alert('Marked as Read', noNextIssueMessage(check.status), [
        {
          text: 'OK',
          onPress: async () => {
            await setStatus(db, comic.id, 'read');
            router.back();
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : String(e));
    } finally {
      setChecking(false);
    }
  }

  async function handleCheckNextIssue() {
    if (!comic) return;
    setChecking(true);
    try {
      const check = await resolveNextIssue(comic);

      if (check.status === 'found') {
        Alert.alert(`New issue: ${check.match.title}`, 'Add it to your backlog?', [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              await insertComic(db, check.match);
              Alert.alert('Added', `${check.match.title} added to your backlog.`);
            },
          },
        ]);
        return;
      }

      Alert.alert('No New Issue', noNextIssueMessage(check.status));
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : String(e));
    } finally {
      setChecking(false);
    }
  }

  async function handleMove(status: ComicStatus) {
    if (!comic) return;
    await setStatus(db, comic.id, status);
    await load();
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

        <ThemedText type="prompt">~/box$ cat</ThemedText>
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
        <View style={[styles.badge, { borderColor: statusColor(comic.status) }]}>
          <ThemedText type="small" style={{ color: statusColor(comic.status) }}>
            {STATUS_LABELS[comic.status]}
          </ThemedText>
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

        {comic.status === 'backlog' && (
          <>
            <View style={styles.section}>
              <TerminalButton
                label="Start Reading"
                variant="solid"
                fullWidth
                onPress={() => handleMove('reading')}
              />
            </View>
            <View style={styles.section}>
              <TerminalButton label="Mark as Read" fullWidth loading={checking} onPress={handleMarkAsRead} />
            </View>
          </>
        )}

        {comic.status === 'reading' && (
          <>
            <View style={styles.section}>
              <TerminalButton
                label="Mark as Read"
                variant="solid"
                fullWidth
                loading={checking}
                onPress={handleMarkAsRead}
              />
            </View>
            <View style={styles.section}>
              <TerminalButton label="Move to Backlog" fullWidth onPress={() => handleMove('backlog')} />
            </View>
          </>
        )}

        {comic.status === 'read' && (
          <>
            {comic.type === 'issue' && (
              <View style={styles.section}>
                <TerminalButton
                  label="Check for Next Issue"
                  variant="solid"
                  fullWidth
                  loading={checking}
                  onPress={handleCheckNextIssue}
                />
              </View>
            )}
            <View style={styles.section}>
              <TerminalButton
                label="Move back to Current Reading"
                fullWidth
                onPress={() => handleMove('reading')}
              />
            </View>
            <View style={styles.section}>
              <TerminalButton label="Move to Backlog" fullWidth onPress={() => handleMove('backlog')} />
            </View>
          </>
        )}

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
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    marginTop: Spacing.one,
  },
  section: {
    marginTop: Spacing.three,
  },
});
