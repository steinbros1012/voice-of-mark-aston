import { type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = PropsWithChildren<{
  /** Wrap content in a ScrollView. Default true. */
  scroll?: boolean;
  /** Safe-area edges to pad. Tabs and stacks already handle the top. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
}>;

/**
 * Base wrapper for every screen: themed background, safe-area padding and a
 * centred max-width column so layouts also look right on tablets and web.
 */
export function Screen({ children, scroll = true, edges = ['bottom'], contentStyle }: ScreenProps) {
  const theme = useTheme();
  const inner = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.scroll}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
