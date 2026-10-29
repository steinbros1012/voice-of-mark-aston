import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, Card, Notice, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';
import { isStripeAvailable, useStripeSheet } from '@/lib/stripe';

import { paymentsApi } from './api';

/**
 * "Add a card" step. Opens Stripe's PaymentSheet in setup mode, then asks
 * the server to confirm a default payment method exists.
 */
export function PaymentMethodCard() {
  const theme = useTheme();
  const { profile, refreshProfile } = useAuth();
  const sheet = useStripeSheet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMethod = Boolean(profile?.has_payment_method);

  async function addCard() {
    if (!sheet) return;
    setBusy(true);
    setError(null);
    try {
      const params = await paymentsApi.setup();
      const init = await sheet.initPaymentSheet({
        merchantDisplayName: 'Beep Me',
        customerId: params.customerId,
        customerEphemeralKeySecret: params.customerEphemeralKeySecret,
        setupIntentClientSecret: params.setupIntentClientSecret,
        returnURL: 'beepme://stripe-redirect',
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', testEnv: __DEV__ },
      });
      if (init.error) throw new Error(init.error.message);
      const result = await sheet.presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== 'Canceled') throw new Error(result.error.message);
        return;
      }
      await paymentsApi.sync();
      await refreshProfile();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <View style={styles.row}>
        <Ionicons name={hasMethod ? 'card' : 'card-outline'} size={22} color={hasMethod ? theme.success : theme.textSecondary} />
        <View style={styles.text}>
          <Text variant="bodyStrong">{hasMethod ? 'Card on file' : 'Add a payment method'}</Text>
          <Text variant="caption" color="textSecondary">
            {hasMethod
              ? 'You are charged only when the driver accepts. Full refund if you cancel before departure.'
              : 'Nothing is charged until a driver accepts your request.'}
          </Text>
        </View>
      </View>
      {!isStripeAvailable ? (
        <Notice
          message={Platform.OS === 'web' ? 'Add a card from the iOS or Android app.' : 'Payments are not configured in this build.'}
          tone="info"
        />
      ) : (
        <Button title={hasMethod ? 'Change card' : 'Add card'} variant={hasMethod ? 'secondary' : 'primary'} size="sm" loading={busy} onPress={addCard} style={styles.button} />
      )}
      {error ? <Notice message={error} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  text: { flex: 1, gap: 2 },
  button: { marginTop: Spacing.md },
});
