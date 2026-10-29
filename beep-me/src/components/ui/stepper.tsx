import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
};

export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const theme = useTheme();
  const button = (icon: 'remove' | 'add', disabled: boolean, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${icon === 'add' ? 'Increase' : 'Decrease'} ${label}`}
      disabled={disabled}
      onPress={() => onChange(value + delta)}
      style={[styles.button, { backgroundColor: theme.surface, opacity: disabled ? 0.4 : 1 }]}>
      <Ionicons name={icon} size={20} color={theme.text} />
    </Pressable>
  );
  return (
    <View style={styles.row}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      {button('remove', value <= min, -1)}
      <Text variant="subheading" style={styles.value}>
        {value}
      </Text>
      {button('add', value >= max, 1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { flex: 1 },
  button: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 32, textAlign: 'center' },
});
