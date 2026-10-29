import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

/** Inline error banner for a form submit failure. Renders nothing when empty. */
export function FormError({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.danger }]}>
      <Text variant="caption" color="danger">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
});
