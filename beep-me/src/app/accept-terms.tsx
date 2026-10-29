import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { ConsentCheckbox, TERMS_VERSION } from '@/features/legal';

/** Shown when the Terms version changed since the student last accepted. */
export default function AcceptTermsScreen() {
  const { profile, updateProfile, signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const firstTime = !profile?.accepted_terms_version;

  async function accept() {
    if (!checked) {
      setError('Tick the box to continue.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ accepted_terms_version: TERMS_VERSION, accepted_terms_at: new Date().toISOString() });
    } catch (err) {
      setError(describeAuthError(err));
      setSaving(false);
    }
  }

  return (
    <Screen edges={['top']} footer={<Button title="Agree and continue" variant="accent" onPress={accept} loading={saving} />}>
      <View style={styles.intro}>
        <Text variant="display">{firstTime ? 'Before you ride' : 'Our terms have changed'}</Text>
        <Text color="textSecondary">
          {firstTime
            ? 'Beep Me is students sharing rides with each other. Please read how it works and what you are agreeing to.'
            : 'Please review the updated Terms of Service and Privacy Policy to keep using Beep Me.'}
        </Text>
      </View>
      <ConsentCheckbox checked={checked} onChange={setChecked} />
      <FormError message={error} />
      <Button title="Log out instead" variant="ghost" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: Spacing.sm } });
