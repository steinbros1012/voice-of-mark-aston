import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
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

function Badge({ icon, tone }: { icon: keyof typeof Ionicons.glyphMap; tone: 'neutral' | 'danger' }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: tone === 'danger' ? theme.dangerMuted : theme.accentMuted }]}>
      <Ionicons name={icon} size={28} color={tone === 'danger' ? theme.danger : theme.text} />
    </View>
  );
}

export function EmptyState({ title, description, icon = 'car-outline', actionLabel, onAction }: StateProps) {
  return (
    <View style={styles.box}>
      <Badge icon={icon} tone="neutral" />
      <Text variant="heading" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" color="textSecondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" size="sm" fullWidth={false} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({ title = "Couldn't load this", description, onAction }: Partial<StateProps>) {
  return (
    <View style={styles.box}>
      <Badge icon="cloud-offline-outline" tone="danger" />
      <Text variant="heading" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" color="textSecondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {onAction ? <Button title="Try again" variant="secondary" size="sm" fullWidth={false} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <ActivityIndicator color={theme.text} />
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  badge: { width: 64, height: 64, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  description: { maxWidth: 300 },
  action: { marginTop: Spacing.xs },
});
