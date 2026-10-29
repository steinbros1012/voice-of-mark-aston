import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type NoticeProps = { message: string | null; tone?: 'error' | 'success' | 'info' };

/** Inline notice. Renders nothing when the message is empty. */
export function Notice({ message, tone = 'error' }: NoticeProps) {
  const theme = useTheme();
  if (!message) return null;
  const palette = {
    error: { bg: theme.dangerMuted, fg: theme.danger, icon: 'alert-circle' as const },
    success: { bg: theme.accentMuted, fg: theme.success, icon: 'checkmark-circle' as const },
    info: { bg: theme.surfaceMuted, fg: theme.textSecondary, icon: 'information-circle' as const },
  }[tone];
  return (
    <View accessibilityRole={tone === 'error' ? 'alert' : undefined} style={[styles.box, { backgroundColor: palette.bg }]}>
      <Ionicons name={palette.icon} size={18} color={palette.fg} />
      <Text variant="caption" style={[styles.text, { color: palette.fg }]}>
        {message}
      </Text>
    </View>
  );
}

export function FormError({ message }: { message: string | null }) {
  return <Notice message={message} tone="error" />;
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md },
  text: { flex: 1 },
});
