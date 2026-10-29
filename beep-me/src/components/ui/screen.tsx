import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = PropsWithChildren<{
  /** Wrap content in a ScrollView. Default true. */
  scroll?: boolean;
  /** Safe-area edges to pad. Headers already cover the top. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
  /** Pinned action area under the content, padded for the home indicator. */
  footer?: React.ReactNode;
  /** Remove horizontal padding (lists manage their own). */
  flush?: boolean;
}>;

/**
 * Base wrapper for every screen: themed background, safe-area padding,
 * keyboard avoidance, a centred max-width column and an optional pinned footer.
 */
export function Screen({ children, scroll = true, edges = [], contentStyle, footer, flush = false }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const inner = <View style={[styles.content, flush ? null : styles.padded, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scroll, !footer ? { paddingBottom: insets.bottom + Spacing.lg } : null]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {inner}
          </ScrollView>
        ) : (
          <View style={styles.scroll}>{inner}</View>
        )}
        {footer ? (
          <View
            style={[
              styles.footer,
              { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, Spacing.md) },
            ]}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BottomBar({ children }: PropsWithChildren) {
  return <View style={styles.bar}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { flex: 1, width: '100%', maxWidth: MaxContentWidth, paddingVertical: Spacing.lg, gap: Spacing.lg },
  padded: { paddingHorizontal: Spacing.lg },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  footerInner: { width: '100%', maxWidth: MaxContentWidth },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});
