import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, BottomBar, Button, Card, ErrorState, FormError, ListRow, LoadingState, Notice, Screen, Stepper, Text, VerifiedPill } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { getBeep, RideSummary, seatsLeft } from '@/features/beeps';
import { createSeatRequest } from '@/features/requests';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';

export default function RequestSeatScreen() {
  const { beepId } = useLocalSearchParams<{ beepId: string }>();
  const router = useRouter();
  const analytics = useAnalytics();
  const { user } = useAuth();
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBeep = useCallback(() => getBeep(beepId), [beepId]);
  const { data: beep, error: loadError, isLoading, refetch } = useQuery(fetchBeep, { refetchOnFocus: false });

  if (isLoading) return <LoadingState />;
  if (loadError || !beep) return <ErrorState description={loadError ?? 'Ride not found.'} onAction={refetch} />;

  const left = seatsLeft(beep);
  const total = seats * beep.price_per_seat_cents;

  async function submit() {
    if (!user || !beep) return;
    setSubmitting(true);
    setError(null);
    try {
      const request = await createSeatRequest(beep.id, user.id, seats);
      analytics.track('seat_requested', { beep_id: beep.id, seat_request_id: request.id, seats_requested: seats });
      router.replace({ pathname: '/booking/[id]', params: { id: request.id, created: '1' } });
    } catch (err) {
      setError(describeAuthError(err));
      setSubmitting(false);
    }
  }

  return (
    <Screen
      footer={
        <BottomBar>
          <View style={styles.priceBlock}>
            <Text variant="title">{formatCents(total)}</Text>
            <Text variant="caption" color="textSecondary">
              {seats} × {formatCents(beep.price_per_seat_cents)}
            </Text>
          </View>
          <Button title="Send request" variant="accent" style={styles.grow} loading={submitting} disabled={left === 0} onPress={submit} />
        </BottomBar>
      }>
      <RideSummary beep={beep} />
      <Card>
        <View style={styles.driver}>
          <Avatar uri={beep.driver.avatar_url} name={beep.driver.display_name} size={40} />
          <View style={styles.driverText}>
            <Text variant="bodyStrong">{beep.driver.display_name}</Text>
            <VerifiedPill />
          </View>
        </View>
      </Card>
      <Card>
        <Stepper label="Seats" value={seats} min={1} max={Math.max(1, Math.min(8, left))} onChange={setSeats} hint={`${left} available`} />
      </Card>
      <Card flush style={styles.rows}>
        <ListRow icon="card-outline" title="Payment" subtitle="No charge yet. In-app payment with a 15% Beep Me fee arrives in the next release; until then you settle with the driver directly." />
        <ListRow icon="time-outline" title="What happens next" subtitle="The driver reviews your request. Once accepted, coordinate pickup in chat." />
        <ListRow icon="shield-checkmark-outline" title="Cancellation" subtitle="Cancel any time before departure from your Trips tab." last />
      </Card>
      <Notice message="Only verified students can see and request this ride. Verification is not a background check." tone="info" />
      <FormError message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  priceBlock: { minWidth: 88 },
  grow: { flex: 1 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  driverText: { gap: 4 },
  rows: { paddingHorizontal: Spacing.lg },
});
