import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Notice, ProgressSteps, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth, validateOtpCode } from '@/features/auth';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email = '', mode = 'signup' } = useLocalSearchParams<{ email?: string; mode?: 'signup' | 'login' }>();
  const { verifyCode, requestCode } = useAuth();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendAgain() {
    setFormError(null);
    setNotice(null);
    try {
      await requestCode({ email, createAccount: mode === 'signup' });
      setNotice(`We sent a new code to ${email}.`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(describeAuthError(error));
    }
  }

  async function submit() {
    const problem = validateOtpCode(code);
    setCodeError(problem);
    if (problem) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await verifyCode({ email, code });
      // Session is now set; the root layout moves on to onboarding or the app.
    } catch (error) {
      setFormError(describeAuthError(error));
      setSubmitting(false);
    }
  }

  if (!email) {
    return (
      <Screen contentStyle={styles.center}>
        <Text variant="title">Missing email</Text>
        <Text color="textSecondary">Start again so we know where to send your code.</Text>
        <Button title="Back to sign-up" onPress={() => router.replace('/sign-up')} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Verify and continue" variant="accent" onPress={submit} loading={submitting} />}>
      {mode === 'signup' ? <ProgressSteps step={2} total={3} /> : null}
      <View style={styles.intro}>
        <Text variant="display">Check your inbox</Text>
        <Text color="textSecondary">
          Enter the 6-digit code we sent to <Text variant="bodyStrong">{email}</Text>.
        </Text>
      </View>
      <TextField
        label="Verification code"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        error={codeError}
        onSubmitEditing={submit}
        style={styles.code}
      />
      <Notice message={notice} tone="success" />
      <FormError message={formError} />
      <View style={styles.secondary}>
        <Button
          title={cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
          variant="ghost"
          onPress={sendAgain}
          disabled={cooldown > 0}
        />
        <Button title="Use a different email" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.sm },
  center: { justifyContent: 'center', gap: Spacing.lg },
  code: { fontSize: 24, letterSpacing: 6, fontWeight: '600' },
  secondary: { gap: Spacing.xs },
});
