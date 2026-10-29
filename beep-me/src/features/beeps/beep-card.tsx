import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDeparture, pluralize } from '@/lib/format';

import { seatsLeft, type BeepWithDriver } from './api';

export function BeepCard({ beep }: { beep: BeepWithDriver }) {
  const theme = useTheme();
  const router = useRouter();
  const left = seatsLeft(beep);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/beep/[id]', params: { id: beep.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${beep.origin} to ${beep.destination}, ${formatDeparture(beep.departure_at)}, ${formatCents(beep.price_per_seat_cents)} per seat`}
        style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.route}>
          <View style={styles.routeText}>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {beep.origin}
            </Text>
            <Text variant="subheading" numberOfLines={1}>
              {beep.destination}
            </Text>
          </View>
          <View style={styles.price}>
            <Text variant="subheading">{formatCents(beep.price_per_seat_cents)}</Text>
            <Text variant="caption" color="textSecondary">
              per seat
            </Text>
          </View>
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text variant="caption">{formatDeparture(beep.departure_at)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
            <Text variant="caption" color={left === 0 ? 'danger' : 'text'}>
              {left === 0 ? 'Full' : `${pluralize(left, 'seat')} left`}
            </Text>
          </View>
        </View>
        <View style={styles.driver}>
          <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={28} />
          <Text variant="caption" color="textSecondary" numberOfLines={1} style={styles.driverName}>
            {beep.driver.display_name}
            {beep.driver.average_rating ? ` · ★ ${beep.driver.average_rating.toFixed(1)}` : ' · New driver'}
          </Text>
        </View>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  route: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  routeText: { flex: 1 },
  price: { alignItems: 'flex-end' },
  meta: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  driverName: { flex: 1 },
});
