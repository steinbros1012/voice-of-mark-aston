import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ConsentCheckboxProps = { checked: boolean; onChange: (next: boolean) => void; error?: string | null };

/** "I agree to the Terms and Privacy Policy" with links to each document. */
export function ConsentCheckbox({ checked, onChange, error }: ConsentCheckboxProps) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
          onPress={() => onChange(!checked)}
          style={[styles.box, { borderColor: error ? theme.danger : checked ? theme.ink : theme.borderStrong, backgroundColor: checked ? theme.ink : theme.surface }]}>
          {checked ? <Ionicons name="checkmark" size={18} color={theme.inkText} /> : null}
        </Pressable>
        <Text variant="caption" style={styles.label}>
          I have read and agree to the{' '}
          <Text variant="captionStrong" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })}>
            Terms of Service
          </Text>
          ,{' '}
          <Text variant="captionStrong" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })}>
            Privacy Policy
          </Text>{' '}
          and{' '}
          <Text variant="captionStrong" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'guidelines' } })}>
            Community Guidelines
          </Text>
          . I understand Beep Me connects students and is not a transportation provider, and that student verification is not a background check.
        </Text>
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  box: { width: 28, height: 28, marginTop: 2, borderRadius: Radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center', minWidth: 28 },
  label: { flex: 1, minHeight: TouchTarget - 16 },
});
