import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  /** Outlined on a surface (default) or bare. */
  variant?: 'outlined' | 'bare';
  disabled?: boolean;
};

export function IconButton({ icon, label, onPress, variant = 'outlined', disabled }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        variant === 'outlined' ? { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 } : null,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={22} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: TouchTarget, height: TouchTarget, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
