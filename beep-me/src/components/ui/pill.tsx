import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BeepStatus, SeatRequestStatus } from '@/types/database';

import { Text } from './text';

type PillTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

type PillProps = { label: string; tone?: PillTone; icon?: keyof typeof Ionicons.glyphMap };

export function Pill({ label, tone = 'neutral', icon }: PillProps) {
  const theme = useTheme();
  const tones: Record<PillTone, { bg: string; fg: string }> = {
    accent: { bg: theme.accent, fg: theme.accentText },
    neutral: { bg: theme.surfaceMuted, fg: theme.textSecondary },
    success: { bg: theme.accentMuted, fg: theme.success },
    warning: { bg: theme.warningMuted, fg: theme.warning },
    danger: { bg: theme.dangerMuted, fg: theme.danger },
  };
  const { bg, fg } = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text variant="tiny" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Student email verification only; it is not a background check. */
export function VerifiedPill() {
  return <Pill label="Student email verified" tone="success" icon="checkmark-circle" />;
}

export function RequestStatusPill({ status }: { status: SeatRequestStatus }) {
  const map: Record<SeatRequestStatus, { label: string; tone: PillTone; icon: keyof typeof Ionicons.glyphMap }> = {
    pending: { label: 'Pending', tone: 'warning', icon: 'time-outline' },
    accepted: { label: 'Accepted', tone: 'success', icon: 'checkmark-circle' },
    declined: { label: 'Declined', tone: 'neutral', icon: 'close-circle-outline' },
    cancelled: { label: 'Cancelled', tone: 'neutral', icon: 'close-circle-outline' },
  };
  const { label, tone, icon } = map[status];
  return <Pill label={label} tone={tone} icon={icon} />;
}

export function BeepStatusPill({ status }: { status: BeepStatus }) {
  const map: Record<BeepStatus, { label: string; tone: PillTone; icon: keyof typeof Ionicons.glyphMap }> = {
    open: { label: 'Open', tone: 'success', icon: 'radio-button-on' },
    full: { label: 'Full', tone: 'warning', icon: 'people' },
    completed: { label: 'Completed', tone: 'neutral', icon: 'checkmark-done' },
    cancelled: { label: 'Cancelled', tone: 'neutral', icon: 'close-circle-outline' },
  };
  const { label, tone, icon } = map[status];
  return <Pill label={label} tone={tone} icon={icon} />;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
});
