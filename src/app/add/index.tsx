import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddChoiceScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="prompt">~/add$ choose</ThemedText>

        <Link href="/add/scan" asChild>
          <Pressable>
            <ThemedView type="surface" style={[styles.option, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">SCAN BARCODE</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Scan a single issue&apos;s UPC or a trade paperback&apos;s ISBN
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

        <Link href="/add/manual" asChild>
          <Pressable>
            <ThemedView type="surface" style={[styles.option, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">ENTER CODE MANUALLY</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Type a UPC or ISBN instead of scanning
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

        <Link href="/add/search" asChild>
          <Pressable>
            <ThemedView type="surface" style={[styles.option, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">SEARCH BY TITLE</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Find a series by name instead
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>
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
    padding: Spacing.three,
    gap: Spacing.three,
  },
  option: {
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.one,
  },
});
