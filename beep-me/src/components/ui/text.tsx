import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { FontSize, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppTextProps = TextProps & {
  variant?: 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  color?: ThemeColor;
};

export function Text({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  return <RNText style={[{ color: theme[color ?? 'text'] }, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: FontSize.xxl, lineHeight: 42, fontWeight: '700' },
  heading: { fontSize: FontSize.xl, lineHeight: 34, fontWeight: '700' },
  subheading: { fontSize: FontSize.lg, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: FontSize.md, lineHeight: 24, fontWeight: '400' },
  caption: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: '600' },
});
