import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';
import { Text } from './text';

type StateProps = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, icon = 'car-outline', actionLabel, onAction }: StateProps) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={40} color={theme.textSecondary} />
      <Text variant="subheading" style={styles.center}>
        {title}
      </Text>
      {description ? (
        <Text color="textSecondary" style={styles.center}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onAction }: Partial<StateProps>) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <Ionicons name="cloud-offline-outline" size={40} color={theme.danger} />
      <Text variant="subheading" style={styles.center}>
        {title}
      </Text>
      {description ? (
        <Text color="textSecondary" style={styles.center}>
          {description}
        </Text>
      ) : null}
      {onAction ? <Button title="Try again" variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <ActivityIndicator color={theme.primary} />
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg },
  center: { textAlign: 'center' },
});
