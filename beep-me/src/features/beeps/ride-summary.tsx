import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDepartureDay, formatTime } from '@/lib/format';
import type { Beep } from '@/types/database';

type RideSummaryProps = { beep: Pick<Beep, 'origin' | 'destination' | 'departure_at' | 'price_per_seat_cents'>; compact?: boolean };

/** Origin → destination timeline with the departure time, reused on detail, request, trip and chat screens. */
export function RouteTimeline({ beep }: { beep: Pick<Beep, 'origin' | 'destination' | 'departure_at'> }) {
  const theme = useTheme();
  return (
    <View style={styles.timeline}>
      <View style={styles.stops}>
        <View style={[styles.stopDot, { borderColor: theme.success }]} />
        <View style={[styles.stopLine, { backgroundColor: theme.borderStrong }]} />
        <Ionicons name="location" size={16} color={theme.danger} />
      </View>
      <View style={styles.stopText}>
        <View style={styles.stopRow}>
          <Text variant="bodyStrong" style={styles.stopName} numberOfLines={2}>
            {beep.origin}
          </Text>
          <Text variant="caption" color="textSecondary">
            {formatTime(beep.departure_at)}
          </Text>
        </View>
        <View style={styles.stopRow}>
          <Text variant="bodyStrong" style={styles.stopName} numberOfLines={2}>
            {beep.destination}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function RideSummary({ beep, compact = false }: RideSummaryProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant={compact ? 'bodyStrong' : 'heading'} numberOfLines={1} style={styles.title}>
          {beep.origin} → {beep.destination}
        </Text>
        <Text variant="bodyStrong">{formatCents(beep.price_per_seat_cents)}</Text>
      </View>
      <Text variant="caption" color="textSecondary">
        {formatDepartureDay(beep.departure_at)} · {formatTime(beep.departure_at)}
      </Text>
      {!compact ? (
        <View style={styles.timelineWrap}>
          <RouteTimeline beep={beep} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  title: { flex: 1 },
  timelineWrap: { marginTop: Spacing.md },
  timeline: { flexDirection: 'row', gap: Spacing.md },
  stops: { alignItems: 'center', width: 16, paddingTop: 4 },
  stopDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3 },
  stopLine: { width: 2, flex: 1, marginVertical: 4 },
  stopText: { flex: 1, gap: Spacing.md },
  stopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm, minHeight: 24 },
  stopName: { flex: 1 },
});
