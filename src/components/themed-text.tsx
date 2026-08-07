import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'subtitle' | 'small' | 'smallBold' | 'prompt';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'prompt' && [styles.prompt, { color: theme.accent }],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: Fonts.monoBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  small: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 17,
  },
  smallBold: {
    fontFamily: Fonts.monoBold,
    fontSize: 12,
    lineHeight: 17,
  },
  prompt: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 15,
  },
});
