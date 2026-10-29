import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Screen } from './screen';
import { Text } from './text';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  /** Build phase that implements this screen, for the scaffold only. */
  phase: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Temporary stand-in used by every route until its phase lands. */
export function PlaceholderScreen({ title, description, phase, icon = 'construct-outline' }: PlaceholderScreenProps) {
  const theme = useTheme();
  return (
    <Screen contentStyle={styles.center}>
      <View style={[styles.badge, { backgroundColor: theme.surface }]}>
        <Ionicons name={icon} size={40} color={theme.primary} />
      </View>
      <Text variant="heading" style={styles.text}>
        {title}
      </Text>
      <Text color="textSecondary" style={styles.text}>
        {description}
      </Text>
      <Text variant="caption" color="textSecondary" style={styles.text}>
        Arrives in Phase {phase}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  text: { textAlign: 'center' },
});
