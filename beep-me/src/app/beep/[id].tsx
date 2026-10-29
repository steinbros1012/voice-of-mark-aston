import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, ErrorState, FormError, LoadingState, Screen, Text } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Radius, Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { cancelBeep, getBeep, seatsLeft, shareBeep } from '@/features/beeps';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';
import { formatDeparture, pluralize } from '@/lib/format';

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} />
      <View style={styles.rowText}>
        <Text variant="caption" color="textSecondary">
          {label}
        </Text>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

export default function BeepDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const analytics = useAnalytics();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBeep = useCallback(() => getBeep(id), [id]);
  const { data: beep, error, isLoading, refetch } = useQuery(fetchBeep);

  useEffect(() => {
    if (beep) analytics.track('beep_viewed', { beep_id: beep.id });
  }, [analytics, beep]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error} onAction={refetch} />;
  if (!beep) {
    return (
      <ErrorState
        title="Beep not found"
        description="It may have been cancelled, or it is on another campus."
        onAction={() => router.back()}
      />
    );
  }

  const isDriver = user?.id === beep.driver_id;
  const left = seatsLeft(beep);
  const statusCopy = {
    open: null,
    full: 'This Beep is full.',
    completed: 'This ride is done.',
    cancelled: 'The driver cancelled this Beep.',
  }[beep.status];

  async function onShare() {
    if (!beep) return;
    try {
      await shareBeep(beep);
    } catch (err) {
      setActionError(describeAuthError(err));
    }
  }

  function confirmCancel() {
    Alert.alert('Cancel this Beep?', 'Riders with requests will see it as cancelled.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel Beep',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelBeep(beep!.id);
            await refetch();
          } catch (err) {
            setActionError(describeAuthError(err));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: beep.destination,
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel="Share this Beep" onPress={onShare} hitSlop={8}>
              <Ionicons name="share-outline" size={24} color={theme.primary} />
            </Pressable>
          ),
        }}
      />
      <Screen>
        <View style={styles.hero}>
          <Text variant="caption" color="textSecondary">
            {beep.origin}
          </Text>
          <Text variant="heading">{beep.destination}</Text>
          <Text variant="subheading" color="primary">
            {formatCents(beep.price_per_seat_cents)} per seat
          </Text>
        </View>

        {statusCopy ? (
          <View style={[styles.banner, { backgroundColor: theme.surface }]}>
            <Text variant="label">{statusCopy}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Row icon="time-outline" label="Leaving" value={formatDeparture(beep.departure_at)} />
          <Row
            icon="people-outline"
            label="Seats"
            value={left === 0 ? `Full (${beep.seats_total} seats)` : `${pluralize(left, 'seat')} left of ${beep.seats_total}`}
          />
          {beep.note ? <Row icon="chatbox-ellipses-outline" label="From the driver" value={beep.note} /> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${beep.driver.display_name}'s profile`}
          onPress={() => router.push({ pathname: '/user/[id]', params: { id: beep.driver.id } })}
          style={[styles.driver, { backgroundColor: theme.surface }]}>
            <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={48} />
            <View style={styles.driverText}>
              <Text variant="label">{beep.driver.display_name}</Text>
              <Text variant="caption" color="textSecondary">
                {beep.driver.average_rating
                  ? `★ ${beep.driver.average_rating.toFixed(1)} · ${pluralize(beep.driver.rating_count, 'review')}`
                  : 'New driver'}
                {` · ${pluralize(beep.driver.rides_given, 'ride')} given`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </Pressable>

        <FormError message={actionError} />

        {isDriver ? (
          beep.status === 'open' ? (
            <Button title="Cancel Beep" variant="danger" onPress={confirmCancel} loading={cancelling} />
          ) : null
        ) : beep.status === 'open' && left > 0 ? (
          <Button
            title={`Request a seat · ${formatCents(beep.price_per_seat_cents)}`}
            onPress={() => router.push({ pathname: '/booking/[id]', params: { id: beep.id } })}
          />
        ) : null}
        <Button title="Share this Beep" variant="secondary" onPress={onShare} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.xs },
  banner: { padding: Spacing.md, borderRadius: Radius.md },
  card: { padding: Spacing.md, borderRadius: Radius.lg, gap: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  rowText: { flex: 1, gap: 2 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  driverText: { flex: 1 },
});
