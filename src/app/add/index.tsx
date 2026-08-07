import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function AddChoiceScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Link href="/add/scan" asChild>
          <Pressable>
            <ThemedView type="backgroundElement" style={styles.option}>
              <ThemedText type="default">Scan barcode</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Scan a single issue&apos;s UPC or a trade paperback&apos;s ISBN
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

        <Link href="/add/manual" asChild>
          <Pressable>
            <ThemedView type="backgroundElement" style={styles.option}>
              <ThemedText type="default">Enter code manually</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Type a UPC or ISBN instead of scanning
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

        <Link href="/add/search" asChild>
          <Pressable>
            <ThemedView type="backgroundElement" style={styles.option}>
              <ThemedText type="default">Search by title</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
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
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
