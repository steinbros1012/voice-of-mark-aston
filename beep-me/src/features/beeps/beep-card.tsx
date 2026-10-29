import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, Pill, Text, VerifiedPill } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDepartureDay, formatTime, pluralize } from '@/lib/format';

import { seatsLeft, type BeepWithDriver } from './api';

type BeepCardProps = { beep: BeepWithDriver; /** Driver's own ride: show status instead of seats-left copy. */ mine?: boolean };

/** Ride row: driver, verification, when, route, seats, price. */
export function BeepCard({ beep, mine = false }: BeepCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const left = seatsLeft(beep);
  const rating = beep.driver.average_rating;

  return (
    <Card
      onPress={() => router.push({ pathname: '/beep/[id]', params: { id: beep.id } })}
      accessibilityLabel={`${beep.origin} to ${beep.destination}, ${formatDepartureDay(beep.departure_at)} ${formatTime(beep.departure_at)}, ${formatCents(beep.price_per_seat_cents)} per seat, ${left} seats left`}>
      <View style={styles.row}>
        <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={44} />
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {beep.driver.display_name}
            </Text>
            {rating ? (
              <View style={styles.rating}>
                <Ionicons name="star" size={13} color={theme.warning} />
                <Text variant="caption">
                  {rating.toFixed(1)} ({beep.driver.rating_count})
                </Text>
              </View>
            ) : (
              <Text variant="caption" color="textSecondary">
                New driver
              </Text>
            )}
          </View>
          <View style={styles.pills}>
            <VerifiedPill />
            {beep.driver.plus_active ? <Pill label="Plus" tone="accent" icon="sparkles" /> : null}
          </View>
          <Text variant="caption" color="textSecondary">
            {formatDepartureDay(beep.departure_at)} · {formatTime(beep.departure_at)}
          </Text>
          <Text variant="caption" numberOfLines={2}>
            {beep.origin} → {beep.destination}
          </Text>
          <View style={styles.meta}>
            {mine ? (
              <Pill label={beep.status === 'open' ? `${pluralize(left, 'seat')} left` : beep.status} tone={beep.status === 'open' ? 'success' : 'neutral'} />
            ) : (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={left === 0 ? theme.danger : theme.textSecondary} />
                <Text variant="caption" color={left === 0 ? 'danger' : 'textSecondary'}>
                  {left === 0 ? 'Full' : `${pluralize(left, 'seat')} left`}
                </Text>
              </View>
            )}
            {beep.trip_type === 'local' ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                <Text variant="caption" color="textSecondary">
                  Local
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.price}>
          <Text variant="heading">{formatCents(beep.price_per_seat_cents)}</Text>
          <Text variant="tiny" color="textMuted">
            / seat
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={styles.chevron} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  body: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pills: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  name: { flexShrink: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { flexDirection: 'row', gap: Spacing.md, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { alignItems: 'flex-end', justifyContent: 'space-between' },
  chevron: { marginTop: Spacing.xs },
});
