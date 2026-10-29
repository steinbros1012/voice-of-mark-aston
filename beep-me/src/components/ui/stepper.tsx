import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  hint?: string;
};

export function Stepper({ label, value, min, max, onChange, hint }: StepperProps) {
  const theme = useTheme();
  const control = (icon: 'remove' | 'add', disabled: boolean, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${icon === 'add' ? 'Increase' : 'Decrease'} ${label}`}
      disabled={disabled}
      onPress={() => onChange(value + delta)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={18} color={theme.text} />
    </Pressable>
  );
  return (
    <View style={styles.row}>
      <View style={styles.labels}>
        <Text variant="label">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textSecondary">
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={[styles.controls, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {control('remove', value <= min, -1)}
        <Text variant="bodyStrong" style={styles.value} accessibilityLiveRegion="polite">
          {value}
        </Text>
        {control('add', value >= max, 1)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  labels: { flex: 1, gap: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: 2 },
  button: { width: TouchTarget - 4, height: TouchTarget - 4, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 36, textAlign: 'center' },
});
