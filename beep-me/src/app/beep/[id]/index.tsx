import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, BeepStatusPill, BottomBar, Button, Card, ErrorState, FormError, IconButton, ListRow, LoadingState, Notice, Screen, Text, VerifiedPill } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Radius, Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { getBeep, RouteTimeline, seatsLeft, shareBeep } from '@/features/beeps';
import { paymentsApi } from '@/features/payments';
import { countPendingByBeep, getMyRequestForBeep } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';
import { formatDepartureDay, hasDeparted, pluralize } from '@/lib/format';

function confirm(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Keep it', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const analytics = useAnalytics();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchBeep = useCallback(() => getBeep(id), [id]);
  const { data: beep, error, isLoading, refetch } = useQuery(fetchBeep);
  const isDriver = Boolean(beep && user && beep.driver_id === user.id);

  const fetchMine = useCallback(
    () => (user && beep && !isDriver ? getMyRequestForBeep(beep.id, user.id) : Promise.resolve(null)),
    [user, beep, isDriver],
  );
  const myRequest = useQuery(fetchMine, { enabled: Boolean(beep && user) });

  const fetchPending = useCallback(
    () => (beep && isDriver ? countPendingByBeep([beep.id]) : Promise.resolve<Record<string, number>>({})),
    [beep, isDriver],
  );
  const pending = useQuery(fetchPending, { enabled: Boolean(beep && isDriver) });

  useEffect(() => {
    if (beep) analytics.track('beep_viewed', { beep_id: beep.id });
  }, [analytics, beep]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error} onAction={refetch} />;
  if (!beep) {
    return <ErrorState title="Ride not found" description="It may have been cancelled, or it is on another campus." onAction={() => router.back()} />;
  }

  const left = seatsLeft(beep);
  const departed = hasDeparted(beep.departure_at);
  const pendingCount = pending.data?.[beep.id] ?? 0;
  const live = myRequest.data;

  async function onShare() {
    if (!beep) return;
    try {
      await shareBeep(beep);
    } catch (err) {
      setActionError(describeAuthError(err));
    }
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await refetch();
    } catch (err) {
      setActionError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const statusNotice = {
    open: null,
    full: 'This ride is full. Check back in case a seat opens up.',
    completed: 'This ride is complete.',
    cancelled: 'The driver cancelled this ride.',
  }[beep.status];

  let footer: React.ReactNode = null;
  if (isDriver) {
    footer = (
      <BottomBar>
        {beep.status === 'open' || beep.status === 'full' ? (
          <>
            <Button
              title={pendingCount ? `Requests (${pendingCount} new)` : 'Requests'}
              icon="people-outline"
              style={styles.grow}
              onPress={() => router.push({ pathname: '/beep/[id]/requests', params: { id: beep.id } })}
            />
            {departed ? (
              <Button
                title="Mark complete"
                variant="accent"
                fullWidth={false}
                loading={busy}
                onPress={() =>
                  run(async () => {
                    const result = await paymentsApi.completeBeep(beep.id);
                    analytics.track('booking_completed', { beep_id: beep.id, paid_out_cents: result.paidOutCents, riders: beep.seats_taken });
                  })
                }
              />
            ) : (
              <Button title="Edit" variant="secondary" fullWidth={false} onPress={() => router.push({ pathname: '/post', params: { edit: beep.id } })} />
            )}
          </>
        ) : (
          <Button title="Back to trips" variant="secondary" onPress={() => router.back()} />
        )}
      </BottomBar>
    );
  } else if (live) {
    footer = (
      <BottomBar>
        <View style={styles.priceBlock}>
          <Text variant="caption" color="textSecondary">
            Your request
          </Text>
          <Text variant="bodyStrong">{live.status === 'accepted' ? 'Accepted' : 'Pending'}</Text>
        </View>
        <Button title="View trip" style={styles.grow} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: live.id } })} />
      </BottomBar>
    );
  } else if (beep.status === 'open' && left > 0 && !departed) {
    footer = (
      <BottomBar>
        <View style={styles.priceBlock}>
          <Text variant="title">{formatCents(beep.price_per_seat_cents)}</Text>
          <Text variant="caption" color="textSecondary">
            / seat
          </Text>
        </View>
        <Button title="Request a seat" variant="accent" style={styles.grow} onPress={() => router.push({ pathname: '/request/[beepId]', params: { beepId: beep.id } })} />
      </BottomBar>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => <IconButton icon="share-outline" label="Share this ride" variant="bare" onPress={onShare} />,
        }}
      />
      <Screen footer={footer}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text variant="display" style={styles.heroTitle}>
              {beep.destination}
            </Text>
            <BeepStatusPill status={beep.status} />
          </View>
          <Text color="textSecondary">
            {formatDepartureDay(beep.departure_at)} · {beep.trip_type === 'local' ? 'Around town' : 'Longer trip'}
          </Text>
        </View>

        {statusNotice ? <Notice message={statusNotice} tone="info" /> : null}

        <Card>
          <RouteTimeline beep={beep} />
        </Card>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${beep.driver.display_name}'s profile`}
          onPress={() => router.push({ pathname: '/user/[id]', params: { id: beep.driver.id } })}
          style={({ pressed }) => [styles.driver, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={48} />
          <View style={styles.driverText}>
            <View style={styles.driverName}>
              <Text variant="bodyStrong">{beep.driver.display_name}</Text>
              {beep.driver.average_rating ? (
                <View style={styles.rating}>
                  <Ionicons name="star" size={13} color={theme.warning} />
                  <Text variant="caption">
                    {beep.driver.average_rating.toFixed(1)} ({beep.driver.rating_count})
                  </Text>
                </View>
              ) : null}
            </View>
            <VerifiedPill />
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>

        <Card flush style={styles.details}>
          <ListRow icon="people-outline" title={left === 0 ? `Full · ${beep.seats_total} seats` : `${pluralize(left, 'seat')} left of ${beep.seats_total}`} />
          <ListRow icon="cash-outline" title={`${formatCents(beep.price_per_seat_cents)} per seat`} subtitle="Charged when the driver accepts. Beep Me keeps 15% plus a $1 booking fee (waived with Plus); the driver receives the rest after the ride." />
          {beep.note ? <ListRow icon="chatbox-ellipses-outline" title="From the driver" subtitle={beep.note} /> : null}
          <ListRow
            icon="shield-checkmark-outline"
            title="Cancellation policy"
            subtitle="Riders can cancel any time before departure for a full refund. Drivers who cancel refund every rider."
            last
          />
        </Card>

        <Text variant="tiny" color="textMuted">
          Student email verification confirms a campus address. It is not a background check.
        </Text>

        <FormError message={actionError} />

        {isDriver && beep.status !== 'cancelled' && beep.status !== 'completed' ? (
          <Button
            title="Cancel ride"
            variant="danger"
            loading={busy}
            onPress={() =>
              confirm('Cancel this ride?', 'Every pending and accepted request on it will be cancelled and paid riders refunded in full.', 'Cancel ride', () => run(() => paymentsApi.cancelBeep(beep.id)))
            }
          />
        ) : null}
        {!isDriver ? (
          <Button
            title="Report this ride"
            variant="ghost"
            onPress={() => router.push({ pathname: '/report', params: { beepId: beep.id, userId: beep.driver_id } })}
          />
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.xs },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  heroTitle: { flex: 1 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderWidth: 1, borderRadius: Radius.lg },
  driverText: { flex: 1, gap: 4 },
  driverName: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  details: { paddingHorizontal: Spacing.lg },
  priceBlock: { minWidth: 72 },
  grow: { flex: 1 },
});
