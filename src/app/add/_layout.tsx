import { Stack } from 'expo-router';

export default function AddLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Add Comic' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan Barcode' }} />
      <Stack.Screen name="manual" options={{ title: 'Enter Code' }} />
      <Stack.Screen name="search" options={{ title: 'Search by Title' }} />
      <Stack.Screen name="confirm" options={{ title: 'Confirm' }} />
    </Stack>
  );
}
