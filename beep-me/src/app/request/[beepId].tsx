import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, BottomBar, Button, Card, ErrorState, FormError, ListRow, LoadingState, Notice, Pill, Screen, Stepper, Text, VerifiedPill } from '@/components/ui';
import { formatCents, quoteBooking } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { getBeep, RideSummary, seatsLeft } from '@/features/beeps';
import { PaymentMethodCard } from '@/features/payments';
import { createSeatRequest } from '@/features/requests';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';

export default function RequestSeatScreen() {
  const { beepId } = useLocalSearchParams<{ beepId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const analytics = useAnalytics();
  const { user, profile } = useAuth();
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBeep = useCallback(() => getBeep(beepId), [beepId]);
  const { data: beep, error: loadError, isLoading, refetch } = useQuery(fetchBeep, { refetchOnFocus: false });

  if (isLoading) return <LoadingState />;
  if (loadError || !beep) return <ErrorState description={loadError ?? 'Ride not found.'} onAction={refetch} />;

  const left = seatsLeft(beep);
  const isPlus = Boolean(profile?.plus_active);
  const quote = quoteBooking(seats, beep.price_per_seat_cents, isPlus);
  const needsCard = quote.amountCents > 0 && !profile?.has_payment_method;

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
            <Text variant="title">{formatCents(quote.amountCents)}</Text>
            <Text variant="caption" color="textSecondary">
              charged on accept
            </Text>
          </View>
          <Button
            title={needsCard ? 'Add a card to request' : 'Send request'}
            variant="accent"
            style={styles.grow}
            loading={submitting}
            disabled={left === 0 || needsCard}
            onPress={submit}
          />
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

      <Card>
        <Text variant="heading" style={styles.quoteTitle}>
          Price breakdown
        </Text>
        <View style={styles.line}>
          <Text variant="caption" color="textSecondary">
            {seats} × {formatCents(beep.price_per_seat_cents)} seat{seats === 1 ? '' : 's'}
          </Text>
          <Text variant="caption">{formatCents(quote.seatSubtotalCents)}</Text>
        </View>
        <View style={styles.line}>
          <View style={styles.feeLabel}>
            <Text variant="caption" color="textSecondary">
              Booking fee
            </Text>
            {isPlus ? <Pill label="Waived with Plus" tone="accent" icon="sparkles" /> : null}
          </View>
          <Text variant="caption" style={isPlus ? { textDecorationLine: 'line-through', color: theme.textMuted } : undefined}>
            {formatCents(isPlus ? 100 : quote.bookingFeeCents)}
          </Text>
        </View>
        <View style={[styles.line, styles.total, { borderTopColor: theme.border }]}>
          <Text variant="bodyStrong">Total</Text>
          <Text variant="bodyStrong">{formatCents(quote.amountCents)}</Text>
        </View>
        {!isPlus && quote.bookingFeeCents > 0 ? (
          <Text variant="tiny" color="textMuted" onPress={() => router.push('/paywall')} style={styles.plusHint}>
            Beep Me Plus riders pay no booking fee. Learn more
          </Text>
        ) : null}
      </Card>

      {quote.amountCents > 0 ? <PaymentMethodCard /> : null}

      <Card flush style={styles.rows}>
        <ListRow icon="time-outline" title="What happens next" subtitle="The driver reviews your request. When they accept, your card is charged and you can coordinate pickup in chat." />
        <ListRow icon="shield-checkmark-outline" title="Cancellation" subtitle="Cancel any time before departure for a full refund. If the driver cancels, you are refunded in full." last />
      </Card>
      <Notice message="Only verified students can see and request this ride. Verification is not a background check." tone="info" />
      <FormError message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  priceBlock: { minWidth: 96 },
  grow: { flex: 1 },
  driver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  driverText: { gap: 4 },
  quoteTitle: { marginBottom: Spacing.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, gap: Spacing.sm },
  feeLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', flex: 1 },
  total: { marginTop: Spacing.xs, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  plusHint: { marginTop: Spacing.sm, textDecorationLine: 'underline' },
  rows: { paddingHorizontal: Spacing.lg },
});
