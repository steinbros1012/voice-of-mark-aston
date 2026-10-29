import { Ionicons } from '@expo/vector-icons';
import type { ComponentRef, Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { webInputReset } from '@/lib/platform';

import { Text } from './text';

type TextFieldProps = TextInputProps & {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Small text shown under the field on the right, e.g. a character count. */
  counter?: string;
};

export function TextField({ ref, label, error, hint, icon, counter, style, multiline, editable = true, ...rest }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        style={[
          styles.box,
          multiline ? styles.multiline : null,
          {
            backgroundColor: editable ? theme.surface : theme.surfaceMuted,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={theme.textMuted} style={styles.icon} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={theme.textMuted}
          editable={editable}
          multiline={multiline}
          style={[styles.input, multiline ? styles.inputMultiline : null, { color: theme.text }, webInputReset, style]}
          {...rest}
        />
      </View>
      <View style={styles.footer}>
        {error ? (
          <Text variant="caption" color="danger" style={styles.footerText}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" color="textSecondary" style={styles.footerText}>
            {hint}
          </Text>
        ) : (
          <View style={styles.footerText} />
        )}
        {counter ? (
          <Text variant="tiny" color="textMuted">
            {counter}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: Spacing.md },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.body, paddingVertical: Spacing.md },
  inputMultiline: { minHeight: 84, paddingVertical: 0, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  footerText: { flex: 1 },
});
