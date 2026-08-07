import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { resolveBarcode } from '@/services/comics';
import { usePendingMatch } from '@/state/pending-match';

export default function ManualCodeScreen() {
  const { upc: prefilledUpc } = useLocalSearchParams<{ upc?: string }>();
  const [code, setCode] = useState(prefilledUpc ?? '');
  const [supplement, setSupplement] = useState('');
  const [resolving, setResolving] = useState(false);
  const [unresolvedCode, setUnresolvedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const { setPending } = usePendingMatch();

  async function lookup() {
    const trimmed = code.trim() + supplement.trim();
    if (!trimmed) return;
    setResolving(true);
    setUnresolvedCode(null);
    setError(null);
    try {
      const resolution = await resolveBarcode(trimmed);
      if (resolution.status === 'unresolved') {
        setUnresolvedCode(resolution.scannedCode);
      } else {
        setPending(resolution.matches, resolution.scannedCode);
        router.push('/add/confirm');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setResolving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="prompt">~/add/manual$</ThemedText>

        <ThemedText type="small" themeColor="textMuted" style={styles.hint}>
          {prefilledUpc
            ? "We scanned this UPC but couldn't find an exact match — Metron indexes the full code. Type the small 2- or 5-digit code printed next to the barcode below."
            : 'For a trade paperback, type the ISBN-13 in the first field and leave the second blank. For a single issue, Metron indexes the full code — type the 12-digit UPC in the first field and the small 2- or 5-digit code printed next to it in the second field.'}
        </ThemedText>

        <View>
          <ThemedText type="small" themeColor="textMuted">
            UPC OR ISBN
          </ThemedText>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="e.g. 761941341828"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            returnKeyType="next"
          />
        </View>

        <View>
          <ThemedText type="small" themeColor="textMuted">
            SUPPLEMENT CODE (SINGLE ISSUES ONLY, OPTIONAL)
          </ThemedText>
          <TextInput
            value={supplement}
            onChangeText={setSupplement}
            onSubmitEditing={lookup}
            placeholder="e.g. 01011"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            returnKeyType="search"
          />
        </View>

        <TerminalButton label="Look Up" variant="solid" onPress={lookup} loading={resolving} />

        {unresolvedCode && (
          <View style={styles.messageBox}>
            <ThemedText type="small" themeColor="textMuted" style={styles.message}>
              No match found for code {unresolvedCode} in Metron or OpenLibrary.
            </ThemedText>
            <TerminalButton label="Search by Title Instead" onPress={() => router.push('/add/search')} />
          </View>
        )}

        {error && (
          <ThemedText type="small" themeColor="textMuted" style={styles.message}>
            {error}
          </ThemedText>
        )}
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
  hint: {
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  messageBox: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
