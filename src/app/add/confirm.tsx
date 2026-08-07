import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CandidateCard } from '@/components/candidate-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { insertComic } from '@/db/repository';
import { useTheme } from '@/hooks/use-theme';
import { usePendingMatch } from '@/state/pending-match';

export default function ConfirmScreen() {
  const { matches, scannedCode, clear } = usePendingMatch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const selected = matches[selectedIndex];

  async function confirm() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await insertComic(db, selected, scannedCode);
      clear();
      router.dismissTo('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (matches.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="default" style={styles.message}>
            Nothing to confirm. Go back and scan or search for a comic first.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {matches.length > 1 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Multiple matches found — pick the right one:
          </ThemedText>
        )}

        <FlatList
          data={matches}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <CandidateCard
              match={item}
              selected={index === selectedIndex}
              onPress={() => setSelectedIndex(index)}
            />
          )}
        />

        <View style={styles.footer}>
          {error && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              {error}
            </ThemedText>
          )}
          <Pressable
            onPress={confirm}
            disabled={saving}
            style={[styles.confirmButton, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{saving ? 'Adding…' : 'Add to Current Reading'}</ThemedText>
          </Pressable>
        </View>
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
  hint: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  footer: {
    padding: Spacing.three,
  },
  confirmButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  message: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
