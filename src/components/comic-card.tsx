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

  return (
    <Link href={`/comic/${comic.id}`} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <Image source={comic.coverImageUrl} style={styles.cover} contentFit="cover" transition={150} />
          <View style={styles.info}>
            <ThemedText type="smallBold" numberOfLines={2}>
              {comic.title}
            </ThemedText>
            {comic.author && (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {comic.author}
              </ThemedText>
            )}
            {comic.releaseDate && (
              <ThemedText type="small" themeColor="textSecondary">
                {formatDate(comic.releaseDate)}
              </ThemedText>
            )}
            {comic.type === 'issue' && comic.issueNumber && (
              <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold">#{comic.issueNumber}</ThemedText>
              </View>
            )}
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
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cover: {
    width: 64,
    height: 96,
    borderRadius: Spacing.one,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    marginTop: Spacing.one,
  },
});
