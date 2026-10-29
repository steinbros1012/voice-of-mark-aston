import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Pill, RequestStatusPill, Segmented, Text } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { BeepCard, listMyBeeps, type BeepWithDriver } from '@/features/beeps';
import { countPendingByBeep, listMyRequests, type SeatRequestDetail } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDepartureDay, formatTime, pluralize } from '@/lib/format';

type Mode = 'riding' | 'driving';

function RequestCard({ request }: { request: SeatRequestDetail }) {
  const router = useRouter();
  const { beep } = request;
  return (
    <Card onPress={() => router.push({ pathname: '/booking/[id]', params: { id: request.id } })} accessibilityLabel={`Trip to ${beep.destination}, ${request.status}`}>
      <View style={styles.cardTop}>
        <RequestStatusPill status={request.status} />
        <Text variant="caption" color="textSecondary">
          {formatDepartureDay(beep.departure_at)} · {formatTime(beep.departure_at)}
        </Text>
      </View>
      <Text variant="bodyStrong" numberOfLines={1} style={styles.route}>
        {beep.origin} → {beep.destination}
      </Text>
      <View style={styles.cardBottom}>
        <View style={styles.driver}>
          <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={24} />
          <Text variant="caption" color="textSecondary">
            {beep.driver.display_name} · {pluralize(request.seats_requested, 'seat')}
          </Text>
        </View>
        <Text variant="bodyStrong">{formatCents(request.seats_requested * beep.price_per_seat_cents)}</Text>
      </View>
    </Card>
  );
}

function isUpcomingRequest(r: SeatRequestDetail): boolean {
  return (r.status === 'pending' || r.status === 'accepted') && r.beep.status !== 'cancelled' && r.beep.status !== 'completed';
}

function isUpcomingBeep(b: BeepWithDriver): boolean {
  return b.status === 'open' || b.status === 'full';
}

export default function TripsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('riding');
  const userId = user?.id ?? '';

  const fetchRequests = useCallback(() => listMyRequests(userId), [userId]);
  const requests = useQuery(fetchRequests, { enabled: Boolean(userId) });
  const fetchBeeps = useCallback(() => listMyBeeps(userId), [userId]);
  const beeps = useQuery(fetchBeeps, { enabled: Boolean(userId) });
  const beepIds = (beeps.data ?? []).filter(isUpcomingBeep).map((b) => b.id);
  const beepKey = beepIds.join(',');
  const fetchPending = useCallback(() => countPendingByBeep(beepKey ? beepKey.split(',') : []), [beepKey]);
  const pending = useQuery(fetchPending, { enabled: beepIds.length > 0 });

  const query = mode === 'riding' ? requests : beeps;

  type Row =
    | { kind: 'header'; key: string; title: string }
    | { kind: 'request'; key: string; request: SeatRequestDetail }
    | { kind: 'beep'; key: string; beep: BeepWithDriver };

  const rows: Row[] = [];
  if (mode === 'riding' && requests.data) {
    const upcoming = requests.data.filter(isUpcomingRequest);
    const past = requests.data.filter((r) => !isUpcomingRequest(r));
    if (upcoming.length) rows.push({ kind: 'header', key: 'h-up', title: 'Upcoming' });
    upcoming.forEach((r) => rows.push({ kind: 'request', key: r.id, request: r }));
    if (past.length) rows.push({ kind: 'header', key: 'h-past', title: 'Past and closed' });
    past.forEach((r) => rows.push({ kind: 'request', key: r.id, request: r }));
  }
  if (mode === 'driving' && beeps.data) {
    const upcoming = beeps.data.filter(isUpcomingBeep);
    const past = beeps.data.filter((b) => !isUpcomingBeep(b));
    if (upcoming.length) rows.push({ kind: 'header', key: 'h-up', title: 'Your upcoming rides' });
    upcoming.forEach((b) => rows.push({ kind: 'beep', key: b.id, beep: b }));
    if (past.length) rows.push({ kind: 'header', key: 'h-past', title: 'Past and cancelled' });
    past.forEach((b) => rows.push({ kind: 'beep', key: b.id, beep: b }));
  }

  let empty: React.ReactElement | null = null;
  if (query.isLoading) empty = <LoadingState />;
  else if (query.error && !query.data) empty = <ErrorState description={query.error} onAction={query.refetch} />;
  else if (rows.length === 0) {
    empty =
      mode === 'riding' ? (
        <EmptyState title="No trips yet" description="Find a ride leaving campus and request a seat." icon="ticket-outline" actionLabel="Explore rides" onAction={() => router.push('/')} />
      ) : (
        <EmptyState title="You haven't posted a ride" description="Driving somewhere? Offer your empty seats." icon="car-outline" actionLabel="Post a ride" onAction={() => router.push('/post')} />
      );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: theme.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
              <Text variant="heading" style={styles.groupTitle}>
                {item.title}
              </Text>
            );
          }
          if (item.kind === 'request') return <RequestCard request={item.request} />;
          const count = pending.data?.[item.beep.id] ?? 0;
          return (
            <View style={styles.beepWrap}>
              <BeepCard beep={item.beep} mine />
              {count > 0 ? (
                <View style={styles.badge}>
                  <Pill label={`${count} new ${count === 1 ? 'request' : 'requests'}`} tone="accent" icon="notifications" />
                </View>
              ) : null}
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="display">Trips</Text>
              <Button title="Post a ride" variant="accent" size="sm" fullWidth={false} onPress={() => router.push('/post')} />
            </View>
            <Segmented
              options={[
                { value: 'riding', label: 'Riding' },
                { value: 'driving', label: 'Driving' },
              ]}
              value={mode}
              onChange={setMode}
            />
          </View>
        }
        ListEmptyComponent={empty ? <View style={styles.emptyWrap}>{empty}</View> : undefined}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={query.isRefreshing} onRefresh={query.refetch} tintColor={theme.text} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  header: { gap: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupTitle: { marginTop: Spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  route: { marginBottom: Spacing.sm },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  beepWrap: { position: 'relative' },
  badge: { position: 'absolute', top: -8, right: Spacing.md },
  emptyWrap: { flex: 1, minHeight: 360 },
});
