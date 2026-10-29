import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

/** "2 of 3" with a thin lime progress bar, as on the onboarding screens. */
export function ProgressSteps({ step, total }: { step: number; total: number }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap} accessibilityLabel={`Step ${step} of ${total}`}>
      <Text variant="caption" color="textSecondary" align="center">
        {step} of {total}
      </Text>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { backgroundColor: theme.accent, width: `${Math.round((step / total) * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm, alignItems: 'center' },
  track: { width: 140, height: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: 4, borderRadius: Radius.pill },
});
