import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  /** primary = ink, accent = lime call to action, secondary = outlined white. */
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Stretch to the container width (default) or hug content. */
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: theme.ink, fg: theme.inkText, border: theme.ink },
    accent: { bg: theme.accent, fg: theme.accentText, border: theme.accent },
    secondary: { bg: theme.surface, fg: theme.text, border: theme.borderStrong },
    ghost: { bg: 'transparent', fg: theme.text, border: 'transparent' },
    danger: { bg: theme.surface, fg: theme.danger, border: theme.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: isDisabled ? 0.45 : pressed ? 0.8 : 1 },
        fullWidth ? styles.full : null,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
          <Text variant={size === 'sm' ? 'captionStrong' : 'label'} style={{ color: palette.fg }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  md: { minHeight: 52 },
  sm: { minHeight: TouchTarget, paddingHorizontal: Spacing.lg },
  full: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
