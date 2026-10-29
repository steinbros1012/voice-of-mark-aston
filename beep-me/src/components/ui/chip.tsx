import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Trailing chevron for chips that open a sheet. */
  dropdown?: boolean;
};

/** Pill toggle. Selected = lime fill with a check, matching the reference. */
export function Chip({ label, selected = false, onPress, icon, dropdown }: ChipProps) {
  const theme = useTheme();
  const fg = selected ? theme.accentText : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.surface,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {selected && !icon ? <Ionicons name="checkmark-circle" size={16} color={fg} /> : null}
      {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      <Text variant="captionStrong" style={{ color: fg }}>
        {label}
      </Text>
      {dropdown ? <Ionicons name="chevron-down" size={14} color={fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
