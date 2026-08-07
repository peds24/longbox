import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function AddLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.accent,
        headerTitleStyle: { fontFamily: 'SpaceMono_700Bold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}>
      <Stack.Screen name="index" options={{ title: 'Add Comic' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan Barcode' }} />
      <Stack.Screen name="manual" options={{ title: 'Enter Code' }} />
      <Stack.Screen name="search" options={{ title: 'Search by Title' }} />
      <Stack.Screen name="confirm" options={{ title: 'Confirm' }} />
    </Stack>
  );
}
