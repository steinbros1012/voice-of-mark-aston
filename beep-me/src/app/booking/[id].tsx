import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, ErrorState, FormError, ListRow, LoadingState, Notice, RequestStatusPill, Screen, Text, VerifiedPill } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Radius, Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { RideSummary } from '@/features/beeps';
import { describePaymentStatus, getPaymentForRequest, paymentsApi } from '@/features/payments';
import { describeRequestStatus, getSeatRequest } from '@/features/requests';
import { getMyReview } from '@/features/reviews';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDeparture, hasDeparted, pluralize } from '@/lib/format';

function confirmCancel(refundable: boolean, onConfirm: () => void) {
  const title = 'Cancel this request?';
  const message = refundable ? 'Your seat goes back to the driver and you are refunded in full.' : 'Your seat goes back to the driver.';
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Cancel request', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function TripScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRequest = useCallback(() => getSeatRequest(id), [id]);
  const { data: request, error, isLoading, refetch } = useQuery(fetchRequest);
  const fetchPayment = useCallback(() => getPaymentForRequest(id), [id]);
  const payment = useQuery(fetchPayment);
  const otherId = request ? (request.beep.driver_id === user?.id ? request.rider_id : request.beep.driver_id) : null;
  const fetchReview = useCallback(
    () => (request && user && otherId ? getMyReview(request.beep.id, user.id, otherId) : Promise.resolve(null)),
    [request, user, otherId],
  );
  const myReview = useQuery(fetchReview, { enabled: Boolean(request && user) });

  if (isLoading) return <LoadingState />;
  if (error || !request) return <ErrorState description={error ?? 'Trip not found.'} onAction={refetch} />;

  const isDriver = request.beep.driver_id === user?.id;
  const other = isDriver ? request.rider : request.beep.driver;
  const departed = hasDeparted(request.beep.departure_at);
  const live = request.status === 'pending' || request.status === 'accepted';
  const paid = payment.data;
  const completed = request.beep.status === 'completed';
  const canReview = completed && request.status === 'accepted' && myReview.data === null && !myReview.isLoading;

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await Promise.all([refetch(), payment.refetch()]);
    } catch (err) {
      setActionError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const headline = isDriver
    ? {
        pending: `${request.rider.display_name} wants ${pluralize(request.seats_requested, 'seat')}`,
        accepted: `${request.rider.display_name} is riding with you`,
        declined: 'You declined this request',
        cancelled: 'This request was cancelled',
      }[request.status]
    : {
        pending: 'Request sent',
        accepted: "You're on this ride",
        declined: 'Request declined',
        cancelled: 'Request cancelled',
      }[request.status];

  const paymentCopy = paid
    ? `${formatCents(paid.amount_cents)} · ${describePaymentStatus(paid.status)}`
    : request.status === 'pending'
      ? isDriver
        ? 'Charged to the rider’s card when you accept.'
        : 'Charged to your card when the driver accepts.'
      : 'No payment recorded.';

  return (
    <>
      <Stack.Screen options={{ title: isDriver ? 'Request' : 'Your trip' }} />
      <Screen>
        {created === '1' ? <Notice message="Your request is in. We'll let you know when the driver responds." tone="success" /> : null}
        <View style={styles.hero}>
          <RequestStatusPill status={request.status} />
          <Text variant="title">{headline}</Text>
          <Text color="textSecondary">
            {isDriver
              ? request.status === 'pending'
                ? 'Accepting charges the rider and confirms the seats.'
                : request.status === 'accepted'
                  ? 'Coordinate pickup in chat.'
                  : ''
              : describeRequestStatus(request.status)}
          </Text>
        </View>

        <RideSummary beep={request.beep} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${other.display_name}'s profile`}
          onPress={() => router.push({ pathname: '/user/[id]', params: { id: other.id } })}
          style={({ pressed }) => [styles.person, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <Avatar uri={other.avatar_url} name={other.display_name} size={44} />
          <View style={styles.personText}>
            <Text variant="caption" color="textSecondary">
              {isDriver ? 'Rider' : 'Driver'}
            </Text>
            <Text variant="bodyStrong">{other.display_name}</Text>
            <VerifiedPill />
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>

        <Card flush style={styles.rows}>
          <ListRow icon="people-outline" title={pluralize(request.seats_requested, 'seat')} subtitle={formatDeparture(request.beep.departure_at)} />
          <ListRow icon="card-outline" title={isDriver ? 'Payment' : 'Your payment'} subtitle={paymentCopy} />
          {paid && isDriver ? (
            <ListRow
              icon="wallet-outline"
              title={`You receive ${formatCents(paid.driver_payout_cents)}`}
              subtitle={
                paid.status === 'paid_out'
                  ? 'Sent to your payout account.'
                  : paid.status === 'refunded'
                    ? 'Refunded to the rider.'
                    : 'Transferred to your payout account when you mark the ride complete.'
              }
            />
          ) : null}
          <ListRow
            icon="shield-checkmark-outline"
            title="Cancellation"
            subtitle={isDriver ? 'Riders can cancel before departure for a full refund. Cancelling your ride refunds everyone.' : 'Cancel any time before departure for a full refund.'}
            last
          />
        </Card>

        <FormError message={actionError} />

        {canReview ? (
          <Button title={`Rate ${other.display_name}`} variant="accent" icon="star-outline" onPress={() => router.push({ pathname: '/rate/[bookingId]', params: { bookingId: request.id } })} />
        ) : null}
        {myReview.data ? <Notice message={`You rated this ride ${myReview.data.stars} out of 5. Thanks!`} tone="success" /> : null}
        {live ? (
          <Button title="Open chat" icon="chatbubble-ellipses-outline" onPress={() => router.push({ pathname: '/chat/[requestId]', params: { requestId: request.id } })} />
        ) : null}
        {isDriver && request.status === 'pending' ? (
          <View style={styles.actions}>
            <Button title="Decline" variant="secondary" fullWidth={false} disabled={busy} onPress={() => act(() => paymentsApi.declineRequest(request.id))} />
            <Button title="Accept and charge" variant="accent" style={styles.grow} loading={busy} onPress={() => act(() => paymentsApi.acceptRequest(request.id))} />
          </View>
        ) : null}
        {!isDriver && live && !departed ? (
          <Button title="Cancel request" variant="danger" loading={busy} onPress={() => confirmCancel(paid?.status === 'succeeded', () => act(() => paymentsApi.cancelRequest(request.id)))} />
        ) : null}
        <Button title="View ride" variant="ghost" onPress={() => router.push({ pathname: '/beep/[id]', params: { id: request.beep.id } })} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderWidth: 1, borderRadius: Radius.lg },
  personText: { flex: 1, gap: 2 },
  rows: { paddingHorizontal: Spacing.lg },
  actions: { flexDirection: 'row', gap: Spacing.md },
  grow: { flex: 1 },
});
