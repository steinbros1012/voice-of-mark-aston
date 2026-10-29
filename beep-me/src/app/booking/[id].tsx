import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, ErrorState, FormError, ListRow, LoadingState, Notice, RequestStatusPill, Screen, Text, VerifiedPill } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Radius, Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { RideSummary } from '@/features/beeps';
import { describeRequestStatus, getSeatRequest, setRequestStatus } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDeparture, hasDeparted, pluralize } from '@/lib/format';

function confirmCancel(onConfirm: () => void) {
  const title = 'Cancel this request?';
  const message = 'Your seat goes back to the driver. You can request again later if seats remain.';
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

  if (isLoading) return <LoadingState />;
  if (error || !request) return <ErrorState description={error ?? 'Trip not found.'} onAction={refetch} />;

  const isDriver = request.beep.driver_id === user?.id;
  const other = isDriver ? request.rider : request.beep.driver;
  const departed = hasDeparted(request.beep.departure_at);
  const live = request.status === 'pending' || request.status === 'accepted';
  const total = request.seats_requested * request.beep.price_per_seat_cents;

  async function act(status: 'accepted' | 'declined' | 'cancelled') {
    setBusy(true);
    setActionError(null);
    try {
      await setRequestStatus(request!.id, status);
      await refetch();
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
                ? 'Accept to confirm the seats, or decline.'
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
          <ListRow icon="cash-outline" title={`${formatCents(total)} total`} subtitle="Paid directly to the driver for now. In-app payment with a 15% Beep Me fee arrives in the next release." />
          <ListRow
            icon="shield-checkmark-outline"
            title="Cancellation"
            subtitle={isDriver ? 'Riders can cancel before departure. Cancelling your ride releases every seat.' : 'Cancel any time before departure.'}
            last
          />
        </Card>

        <FormError message={actionError} />

        {live ? (
          <Button title="Open chat" icon="chatbubble-ellipses-outline" onPress={() => router.push({ pathname: '/chat/[requestId]', params: { requestId: request.id } })} />
        ) : null}
        {isDriver && request.status === 'pending' ? (
          <View style={styles.actions}>
            <Button title="Decline" variant="secondary" fullWidth={false} disabled={busy} onPress={() => act('declined')} />
            <Button title="Accept" variant="accent" style={styles.grow} loading={busy} onPress={() => act('accepted')} />
          </View>
        ) : null}
        {!isDriver && live && !departed ? (
          <Button title="Cancel request" variant="danger" loading={busy} onPress={() => confirmCancel(() => act('cancelled'))} />
        ) : null}
        {request.beep.status === 'completed' ? (
          <Button title="Rate this ride" variant="secondary" onPress={() => router.push({ pathname: '/rate/[bookingId]', params: { bookingId: request.id } })} />
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
