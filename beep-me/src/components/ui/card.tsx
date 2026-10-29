import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Remove inner padding when children manage their own. */
  flush?: boolean;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
};

/** White surface with a subtle border. No shadows, per the reference. */
export function Card({ children, style, flush = false, onPress, accessibilityLabel }: CardProps) {
  const theme = useTheme();
  const base = [styles.card, flush ? null : styles.padded, { backgroundColor: theme.surface, borderColor: theme.border }];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: 1 },
  padded: { padding: Spacing.lg },
});
