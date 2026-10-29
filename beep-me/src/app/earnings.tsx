import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, ErrorState, LoadingState, Notice, Pill, Screen, Text } from '@/components/ui';
import { formatCents } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { describePaymentStatus, listEarnings, PaymentMethodCard, paymentsApi } from '@/features/payments';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDepartureDay } from '@/lib/format';
import type { PaymentStatus } from '@/types/database';

const TONES: Record<PaymentStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'accent'> = {
  pending: 'warning',
  succeeded: 'success',
  paid_out: 'accent',
  refunded: 'neutral',
  failed: 'danger',
};

export default function EarningsScreen() {
  const theme = useTheme();
  const { connect } = useLocalSearchParams<{ connect?: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? '';

  const fetchEarnings = useCallback(() => listEarnings(userId), [userId]);
  const earnings = useQuery(fetchEarnings, { enabled: Boolean(userId) });

  const refreshStatus = useCallback(async () => {
    if (!profile?.stripe_account_id) return;
    try {
      await paymentsApi.connectStatus();
      await refreshProfile();
    } catch {
      // Status refresh is best-effort; the webhook also updates it.
    }
  }, [profile?.stripe_account_id, refreshProfile]);

  // Returning from Stripe onboarding (deep link) or on open: refresh payout status.
  useEffect(() => {
    void refreshStatus();
  }, [connect, refreshStatus]);

  async function setUpPayouts() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await paymentsApi.connectOnboard();
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openAuthSessionAsync(url, 'beepme://earnings');
      }
      await refreshStatus();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const rows = earnings.data ?? [];
  const totals = rows.reduce(
    (acc, p) => {
      if (p.status === 'paid_out') acc.paidOut += p.driver_payout_cents;
      if (p.status === 'succeeded') acc.pending += p.driver_payout_cents;
      return acc;
    },
    { paidOut: 0, pending: 0 },
  );
  const payoutsEnabled = Boolean(profile?.payouts_enabled);

  return (
    <Screen>
      <Card>
        <View style={styles.statusRow}>
          <Ionicons name={payoutsEnabled ? 'checkmark-circle' : 'wallet-outline'} size={22} color={payoutsEnabled ? theme.success : theme.textSecondary} />
          <View style={styles.statusText}>
            <Text variant="bodyStrong">{payoutsEnabled ? 'Payouts set up' : 'Set up payouts to accept paid requests'}</Text>
            <Text variant="caption" color="textSecondary">
              {payoutsEnabled
                ? 'Stripe sends your share to your bank after each completed ride.'
                : 'Stripe collects your bank details and identity once. Beep Me never sees your bank account.'}
            </Text>
          </View>
        </View>
        {connect === 'refresh' ? <Notice message="That link expired. Start payout setup again." tone="info" /> : null}
        {error ? <Notice message={error} /> : null}
        <Button
          title={payoutsEnabled ? 'Update payout details' : 'Set up payouts'}
          variant={payoutsEnabled ? 'secondary' : 'accent'}
          size="sm"
          loading={busy}
          onPress={setUpPayouts}
          style={styles.button}
        />
      </Card>

      <View style={styles.totals}>
        <Card style={styles.total}>
          <Text variant="title">{formatCents(totals.paidOut)}</Text>
          <Text variant="caption" color="textSecondary">
            Paid out
          </Text>
        </Card>
        <Card style={styles.total}>
          <Text variant="title">{formatCents(totals.pending)}</Text>
          <Text variant="caption" color="textSecondary">
            Pending completion
          </Text>
        </Card>
      </View>

      <Text variant="heading">Riding</Text>
      <PaymentMethodCard />

      <Text variant="heading">Driving history</Text>
      {earnings.isLoading ? (
        <LoadingState />
      ) : earnings.error && !earnings.data ? (
        <ErrorState description={earnings.error} onAction={earnings.refetch} />
      ) : rows.length === 0 ? (
        <EmptyState title="No payments yet" description="Accepted requests on your rides show up here with their payout status." icon="receipt-outline" />
      ) : (
        <View style={styles.list}>
          {rows.map((p) => (
            <Card key={p.id}>
              <View style={styles.rowTop}>
                <Text variant="bodyStrong" numberOfLines={1} style={styles.route}>
                  {p.seat_request.beep.origin} → {p.seat_request.beep.destination}
                </Text>
                <Text variant="bodyStrong">{formatCents(p.driver_payout_cents)}</Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {p.seat_request.rider.display_name} · {formatDepartureDay(p.seat_request.beep.departure_at)} · rider paid {formatCents(p.amount_cents)}
              </Text>
              <View style={styles.rowBottom}>
                <Pill label={describePaymentStatus(p.status)} tone={TONES[p.status]} />
              </View>
            </Card>
          ))}
        </View>
      )}
      <Text variant="tiny" color="textMuted">
        Beep Me keeps 15% of each seat plus the rider booking fee, before Stripe processing costs.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  statusText: { flex: 1, gap: 2 },
  button: { marginTop: Spacing.md },
  totals: { flexDirection: 'row', gap: Spacing.md },
  total: { flex: 1 },
  list: { gap: Spacing.md },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  route: { flex: 1 },
  rowBottom: { marginTop: Spacing.sm },
});
