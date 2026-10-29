import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { FontSize, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'captionStrong'
  | 'tiny';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ThemeColor;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  return (
    <RNText
      style={[{ color: theme[color] }, styles[variant], align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: FontSize.display, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  title: { fontSize: FontSize.title, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: FontSize.heading, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: FontSize.body, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: FontSize.body, lineHeight: 24, fontWeight: '600' },
  label: { fontSize: FontSize.label, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: FontSize.caption, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontSize: FontSize.caption, lineHeight: 18, fontWeight: '600' },
  tiny: { fontSize: FontSize.tiny, lineHeight: 16, fontWeight: '500' },
});
