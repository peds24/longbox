import { Platform } from 'react-native';

/**
 * Longbox is a single dark "terminal" theme — there is no light mode, matching
 * a real terminal. Values match the Longbox mockup: https://claude.ai/code/artifact/a43fc1fb-2758-41b4-b4f2-854b7137c3da
 * (Yellow-Orange accent option, #FCB001).
 */
export const Colors = {
  bg: '#0B0902',
  surface: '#171106',
  border: '#3A2C0E',
  text: '#F5EAD4',
  textMuted: '#A6935F',
  accent: '#FCB001',
  accentInk: '#1F1500',
  success: '#43D17A',
  danger: '#F2564B',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = {
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = 0;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
