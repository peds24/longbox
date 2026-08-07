import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrackedComic } from '@/types/comic';

function formatDate(iso?: string) {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ComicCard({ comic }: { comic: TrackedComic }) {
  const theme = useTheme();
  const meta = [comic.author, formatDate(comic.releaseDate)].filter(Boolean).join(' · ');

  return (
    <Link href={`/comic/${comic.id}`} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView type="surface" style={[styles.card, { borderColor: theme.border }]}>
          <Image
            source={comic.coverImageUrl}
            style={[styles.cover, { borderColor: theme.border }]}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
                {comic.title}
              </ThemedText>
              {comic.type === 'issue' && comic.issueNumber ? (
                <ThemedText type="small" style={{ color: theme.accent }}>
                  [#{comic.issueNumber}]
                </ThemedText>
              ) : (
                <ThemedText type="small" themeColor="textMuted">
                  [TPB]
                </ThemedText>
              )}
            </View>
            {meta.length > 0 && (
              <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
                {meta}
              </ThemedText>
            )}
            <View
              style={[
                styles.badge,
                { borderColor: comic.status === 'read' ? theme.success : theme.accent },
              ]}>
              <ThemedText
                type="small"
                style={{ color: comic.status === 'read' ? theme.success : theme.accent }}>
                {comic.status === 'read' ? 'READ' : 'READING'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two + 2,
    borderWidth: 1,
  },
  cover: {
    width: 56,
    height: 84,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
    justifyContent: 'center',
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
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
});
