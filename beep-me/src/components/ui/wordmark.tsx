import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

/** "beep me" with the lime spark, used in headers and on the welcome screen. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const theme = useTheme();
  const fontSize = size === 'lg' ? 34 : 20;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="beep me">
      <Text style={{ fontSize, lineHeight: fontSize * 1.2, fontWeight: '800', letterSpacing: -0.8 }}>beep me</Text>
      <Ionicons name="sparkles" size={size === 'lg' ? 22 : 14} color={theme.accent} style={styles.spark} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  spark: { marginLeft: 2, marginTop: 2 },
});
