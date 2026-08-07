import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ComicMatch, ComicMatchSource } from '@/services/comics/types';

const SOURCE_LABELS: Record<ComicMatchSource, string> = {
  metron: 'Metron',
  openlibrary: 'OpenLibrary',
  google_books: 'Google Books',
};

export function CandidateCard({
  match,
  selected,
  onPress,
}: {
  match: ComicMatch;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView
        type="surface"
        style={[styles.card, { borderColor: selected ? theme.accent : theme.border }]}>
        <Image
          source={match.coverImageUrl}
          style={[styles.cover, { borderColor: theme.border }]}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" numberOfLines={2} style={styles.title}>
              {match.title}
            </ThemedText>
            {match.issueNumber && (
              <ThemedText type="small" style={{ color: theme.accent }}>
                [#{match.issueNumber}]
              </ThemedText>
            )}
          </View>
          {match.author && (
            <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
              {match.author}
            </ThemedText>
          )}
          {match.releaseDate && (
            <ThemedText type="small" themeColor="textMuted">
              {match.releaseDate}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textMuted">
            {match.type === 'issue' ? 'Single issue' : 'Trade paperback'} · via {SOURCE_LABELS[match.source]}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
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
    borderWidth: 2,
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
});
