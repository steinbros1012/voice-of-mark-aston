import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type ListRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  /** Hide the bottom divider (last row). */
  last?: boolean;
  destructive?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

/** Settings-style row: icon, title, optional subtitle/value, chevron when tappable. */
export function ListRow({ icon, title, subtitle, value, onPress, last, destructive, left, right }: ListRowProps) {
  const theme = useTheme();
  const color = destructive ? theme.danger : theme.text;
  const content = (
    <View style={[styles.row, !last ? { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth } : null]}>
      {left ?? (icon ? <Ionicons name={icon} size={20} color={destructive ? theme.danger : theme.textSecondary} /> : null)}
      <View style={styles.text}>
        <Text variant="bodyStrong" style={{ color }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="caption" color="textSecondary">
          {value}
        </Text>
      ) : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.textMuted} /> : null)}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: TouchTarget + 8, paddingVertical: Spacing.md },
  text: { flex: 1, gap: 2 },
});
