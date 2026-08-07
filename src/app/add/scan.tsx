import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TerminalButton } from '@/components/terminal-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isIsbn, resolveBarcode } from '@/services/comics';
import { usePendingMatch } from '@/state/pending-match';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [resolving, setResolving] = useState(false);
  const [unresolvedCode, setUnresolvedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handledRef = useRef(false);
  const router = useRouter();
  const theme = useTheme();
  const { setPending } = usePendingMatch();

  async function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (handledRef.current) return;
    handledRef.current = true;
    setResolving(true);
    setUnresolvedCode(null);
    setErrorMessage(null);

    try {
      const resolution = await resolveBarcode(result.data);
      if (resolution.status === 'unresolved') {
        setUnresolvedCode(resolution.scannedCode);
      } else {
        setPending(resolution.matches, resolution.scannedCode);
        router.push('/add/confirm');
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setResolving(false);
    }
  }

  function scanAgain() {
    handledRef.current = false;
    setUnresolvedCode(null);
    setErrorMessage(null);
  }

  if (!permission) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="default" style={styles.message}>
          Camera access is needed to scan comic barcodes.
        </ThemedText>
        <TerminalButton label="Grant Camera Access" variant="solid" onPress={requestPermission} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={handledRef.current ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        {resolving && (
          <View style={[styles.statusBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <ActivityIndicator color={theme.accent} />
            <ThemedText type="small" themeColor="textMuted" style={styles.statusText}>
              Looking that up…
            </ThemedText>
          </View>
        )}

        {unresolvedCode && (
          <View style={[styles.statusBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <ThemedText type="small" themeColor="textMuted" style={styles.statusText}>
              No match found for code {unresolvedCode}.
              {!isIsbn(unresolvedCode) &&
                ' Single issues need the small supplement code next to the barcode too.'}
            </ThemedText>
            <View style={styles.row}>
              <TerminalButton label="Scan Again" size="sm" onPress={scanAgain} />
              {!isIsbn(unresolvedCode) && (
                <TerminalButton
                  label="Add Supplement Code"
                  size="sm"
                  onPress={() => router.push({ pathname: '/add/manual', params: { upc: unresolvedCode } })}
                />
              )}
              <TerminalButton label="Search by Title" size="sm" onPress={() => router.push('/add/search')} />
            </View>
          </View>
        )}

        {errorMessage && (
          <View style={[styles.statusBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <ThemedText type="small" themeColor="textMuted" style={styles.statusText}>
              {errorMessage}
            </ThemedText>
            <TerminalButton label="Try Again" onPress={scanAgain} />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusBox: {
    borderTopWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  statusText: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
