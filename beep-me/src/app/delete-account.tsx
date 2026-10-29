import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, FormError, ListRow, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { callFunction } from '@/features/payments';

export default function DeleteAccountScreen() {
  const { signOut } = useAuth();
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (confirm.trim() !== 'DELETE') {
      setError('Type DELETE to confirm.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await callFunction<{ ok: true }>('delete-account', { confirm: 'DELETE' });
      await signOut();
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Delete my account" variant="danger" loading={busy} disabled={confirm.trim() !== 'DELETE'} onPress={remove} />}>
      <View style={styles.intro}>
        <Text variant="title">Delete your account</Text>
        <Text color="textSecondary">This cannot be undone. Here is exactly what happens.</Text>
      </View>
      <Card flush style={styles.rows}>
        <ListRow icon="trash-outline" title="Removed right away" subtitle="Your name, photo, bio, campus and login. Your messages and chats. Pending requests are cancelled. Your saved card is removed from Stripe." />
        <ListRow icon="time-outline" title="Gone within 30 days" subtitle="Copies in backups expire." />
        <ListRow icon="receipt-outline" title="Kept, anonymised" subtitle="Payment and payout records for up to 7 years (tax and payment rules), and safety reports. Ratings you left show as from a deleted student." last />
      </Card>
      <Text variant="caption" color="textSecondary">
        You must cancel or complete any upcoming rides and trips first so nobody is left stranded or unpaid.
      </Text>
      <TextField label="Type DELETE to confirm" value={confirm} onChangeText={setConfirm} autoCapitalize="characters" autoCorrect={false} placeholder="DELETE" />
      <FormError message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
  rows: { paddingHorizontal: Spacing.lg },
});
