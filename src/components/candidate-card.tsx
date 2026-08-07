import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ComicMatch } from '@/services/comics/types';

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
        type="backgroundElement"
        style={[styles.card, selected && { borderColor: theme.text, borderWidth: 2 }]}>
        <Image source={match.coverImageUrl} style={styles.cover} contentFit="cover" transition={150} />
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {match.title}
          </ThemedText>
          {match.author && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {match.author}
            </ThemedText>
          )}
          {match.releaseDate && (
            <ThemedText type="small" themeColor="textSecondary">
              {match.releaseDate}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {match.type === 'issue' ? 'Single issue' : 'Trade paperback'} · via {match.source}
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
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
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
});
