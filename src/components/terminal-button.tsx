import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TerminalButtonVariant = 'solid' | 'outline' | 'danger' | 'ghost';

interface TerminalButtonProps {
  label: string;
  onPress?: () => void;
  variant?: TerminalButtonVariant;
  size?: 'default' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TerminalButton({
  label,
  onPress,
  variant = 'outline',
  size = 'default',
  disabled,
  loading,
  fullWidth,
  style,
}: TerminalButtonProps) {
  const theme = useTheme();

  const colors = {
    solid: { bg: theme.accent, border: theme.accent, text: theme.accentInk },
    outline: { bg: 'transparent', border: theme.accent, text: theme.accent },
    danger: { bg: 'transparent', border: theme.danger, text: theme.danger },
    ghost: { bg: 'transparent', border: theme.border, text: theme.textMuted },
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        fullWidth && styles.fullWidth,
        { backgroundColor: colors.bg, borderColor: colors.border },
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <ThemedText type="smallBold" style={[styles.label, { color: colors.text }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  sm: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
