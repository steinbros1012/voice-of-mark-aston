import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, EmptyState, ErrorState, FormError, LoadingState, RequestStatusPill, Screen, Text, VerifiedPill } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError } from '@/features/auth';
import { getBeep, RideSummary, seatsLeft } from '@/features/beeps';
import { listRequestsForBeep, setRequestStatus, type SeatRequestDetail } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';
import { pluralize } from '@/lib/format';

function RequestRow({ request, seatsAvailable, onDecide, busyId }: { request: SeatRequestDetail; seatsAvailable: number; onDecide: (id: string, status: 'accepted' | 'declined') => void; busyId: string | null }) {
  const theme = useTheme();
  const router = useRouter();
  const canAccept = request.seats_requested <= seatsAvailable;
  const busy = busyId === request.id;
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${request.rider.display_name}'s profile`}
        onPress={() => router.push({ pathname: '/user/[id]', params: { id: request.rider.id } })}
        style={styles.riderRow}>
        <Avatar uri={request.rider.avatar_url} name={request.rider.display_name} size={44} />
        <View style={styles.riderText}>
          <View style={styles.nameRow}>
            <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {request.rider.display_name}
            </Text>
            {request.rider.average_rating ? (
              <View style={styles.rating}>
                <Ionicons name="star" size={13} color={theme.warning} />
                <Text variant="caption">{request.rider.average_rating.toFixed(1)}</Text>
              </View>
            ) : null}
            <RequestStatusPill status={request.status} />
          </View>
          {request.rider.edu_verified ? <VerifiedPill /> : null}
          <Text variant="caption" color="textSecondary">
            Wants {pluralize(request.seats_requested, 'seat')} · {pluralize(request.rider.rides_taken, 'ride')} taken
          </Text>
        </View>
      </Pressable>
      {request.status === 'pending' ? (
        <View style={styles.actions}>
          <Button title="Decline" variant="secondary" size="sm" fullWidth={false} disabled={busy} onPress={() => onDecide(request.id, 'declined')} />
          <Button
            title={canAccept ? 'Accept' : 'Not enough seats'}
            variant="accent"
            size="sm"
            style={styles.grow}
            loading={busy}
            disabled={!canAccept}
            onPress={() => onDecide(request.id, 'accepted')}
          />
        </View>
      ) : request.status === 'accepted' ? (
        <View style={styles.actions}>
          <Button title="Message" icon="chatbubble-outline" variant="secondary" size="sm" style={styles.grow} onPress={() => router.push({ pathname: '/chat/[requestId]', params: { requestId: request.id } })} />
        </View>
      ) : null}
    </Card>
  );
}

export default function ManageRequestsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const analytics = useAnalytics();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBeep = useCallback(() => getBeep(id), [id]);
  const beep = useQuery(fetchBeep);
  const fetchRequests = useCallback(() => listRequestsForBeep(id), [id]);
  const requests = useQuery(fetchRequests);

  async function decide(requestId: string, status: 'accepted' | 'declined') {
    setBusyId(requestId);
    setActionError(null);
    try {
      const updated = await setRequestStatus(requestId, status);
      if (status === 'accepted') analytics.track('seat_accepted', { beep_id: updated.beep_id, seat_request_id: updated.id });
      await Promise.all([requests.refetch(), beep.refetch()]);
    } catch (err) {
      setActionError(describeAuthError(err));
    } finally {
      setBusyId(null);
    }
  }

  if (beep.isLoading || requests.isLoading) return <LoadingState />;
  if (beep.error || !beep.data) return <ErrorState description={beep.error ?? 'Ride not found.'} onAction={beep.refetch} />;
  if (requests.error && !requests.data) return <ErrorState description={requests.error} onAction={requests.refetch} />;

  const list = requests.data ?? [];
  const pending = list.filter((r) => r.status === 'pending');
  const accepted = list.filter((r) => r.status === 'accepted');
  const closed = list.filter((r) => r.status === 'declined' || r.status === 'cancelled');
  const available = seatsLeft(beep.data);

  return (
    <Screen>
      <RideSummary beep={beep.data} compact />
      <Text variant="caption" color="textSecondary">
        {pluralize(available, 'seat')} still open · {pluralize(accepted.length, 'rider')} accepted
      </Text>
      <FormError message={actionError} />
      {list.length === 0 ? (
        <EmptyState title="No requests yet" description="Share your ride to reach more students on campus." icon="people-outline" />
      ) : null}
      {pending.length ? (
        <View style={styles.group}>
          <Text variant="heading">Pending ({pending.length})</Text>
          {pending.map((r) => (
            <RequestRow key={r.id} request={r} seatsAvailable={available} onDecide={decide} busyId={busyId} />
          ))}
        </View>
      ) : null}
      {accepted.length ? (
        <View style={styles.group}>
          <Text variant="heading">Riding with you ({accepted.length})</Text>
          {accepted.map((r) => (
            <RequestRow key={r.id} request={r} seatsAvailable={available} onDecide={decide} busyId={busyId} />
          ))}
        </View>
      ) : null}
      {closed.length ? (
        <View style={styles.group}>
          <Text variant="heading" color="textSecondary">
            Closed ({closed.length})
          </Text>
          {closed.map((r) => (
            <RequestRow key={r.id} request={r} seatsAvailable={available} onDecide={decide} busyId={busyId} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  riderText: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { flexShrink: 1, flexGrow: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  grow: { flex: 1 },
  group: { gap: Spacing.md },
});
