import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth, validateOtpCode } from '@/features/auth';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email = '', resend } = useLocalSearchParams<{ email?: string; resend?: string }>();
  const { verifySignUpCode, resendSignUpCode } = useAuth();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const autoResent = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendAgain() {
    setFormError(null);
    setNotice(null);
    try {
      await resendSignUpCode(email);
      setNotice(`We sent a new code to ${email}.`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(describeAuthError(error));
    }
  }

  // Arriving from log-in with an unconfirmed address: send a fresh code once.
  useEffect(() => {
    if (resend === '1' && email && !autoResent.current) {
      autoResent.current = true;
      void sendAgain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resend, email]);

  async function submit() {
    const problem = validateOtpCode(code);
    setCodeError(problem);
    if (problem) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await verifySignUpCode({ email, code });
      // Session is now set; the root layout moves us to onboarding.
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!email) {
    return (
      <Screen contentStyle={styles.center}>
        <Text variant="heading">Missing email</Text>
        <Text color="textSecondary">Start again from sign-up so we know where to send your code.</Text>
        <Button title="Go to sign-up" onPress={() => router.replace('/sign-up')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text variant="heading">Check your inbox</Text>
        <Text color="textSecondary">
          Enter the 6-digit code we sent to <Text variant="label">{email}</Text>. It proves you are a student and
          unlocks your campus.
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
      />
      {notice ? (
        <Text variant="caption" color="success">
          {notice}
        </Text>
      ) : null}
      <FormError message={formError} />
      <Button title="Verify" onPress={submit} loading={submitting} />
      <Button
        title={cooldown > 0 ? `Send a new code (${cooldown}s)` : 'Send a new code'}
        variant="ghost"
        onPress={sendAgain}
        disabled={cooldown > 0}
      />
      <Button title="Use a different email" variant="ghost" onPress={() => router.replace('/sign-up')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
  center: { justifyContent: 'center', gap: Spacing.md },
});
