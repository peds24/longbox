import { SpaceMono_400Regular, SpaceMono_700Bold, useFonts } from '@expo-google-fonts/space-mono';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { Colors } from '@/constants/theme';
import { migrateDbIfNeeded } from '@/db/migrations';
import { PendingMatchProvider } from '@/state/pending-match';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ SpaceMono_400Regular, SpaceMono_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SQLiteProvider databaseName="comic-track.db" onInit={migrateDbIfNeeded}>
      <PendingMatchProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Colors.bg },
              headerTintColor: Colors.accent,
              headerTitleStyle: { fontFamily: 'SpaceMono_700Bold' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: Colors.bg },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="comic/[id]" options={{ presentation: 'modal', title: 'Comic' }} />
          </Stack>
        </ThemeProvider>
      </PendingMatchProvider>
    </SQLiteProvider>
  );
}
