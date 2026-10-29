import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export function Button({ title, variant = 'primary', loading = false, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background = {
    primary: theme.primary,
    secondary: theme.surface,
    ghost: 'transparent',
    danger: theme.danger,
  }[variant];
  const foreground = {
    primary: theme.primaryText,
    secondary: theme.text,
    ghost: theme.primary,
    danger: '#FFFFFF',
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text variant="label" style={{ color: foreground }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
