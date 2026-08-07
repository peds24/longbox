import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CandidateCard } from '@/components/candidate-card';
import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { insertComic } from '@/db/repository';
import { usePendingMatch } from '@/state/pending-match';

export default function ConfirmScreen() {
  const { matches, scannedCode, clear } = usePendingMatch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useSQLiteContext();
  const router = useRouter();

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
        <ThemedText type="prompt" style={styles.prompt}>
          ~/add/confirm$
        </ThemedText>
        {matches.length > 1 && (
          <ThemedText type="small" themeColor="textMuted" style={styles.hint}>
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
            <ThemedText type="small" themeColor="textMuted" style={styles.hint}>
              {error}
            </ThemedText>
          )}
          <TerminalButton
            label={saving ? 'Adding…' : 'Add to Current Reading'}
            variant="solid"
            fullWidth
            loading={saving}
            onPress={confirm}
          />
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
  prompt: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  hint: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  footer: {
    padding: Spacing.three,
  },
  message: {
    textAlign: 'center',
    padding: Spacing.four,
  },
});
