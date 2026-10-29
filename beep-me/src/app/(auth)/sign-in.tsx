import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth, validateEmail } from '@/features/auth';

export default function SignInScreen() {
  const router = useRouter();
  const { requestCode } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const problem = validateEmail(email);
    setEmailError(problem);
    if (problem) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await requestCode({ email, createAccount: false });
      router.push({ pathname: '/verify-email', params: { email: email.trim().toLowerCase(), mode: 'login' } });
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen footer={<Button title="Send login code" variant="accent" onPress={submit} loading={submitting} />}>
      <View style={styles.intro}>
        <Text variant="display">Welcome back</Text>
        <Text color="textSecondary">Enter your student email and we&apos;ll send a one-time login code.</Text>
      </View>
      <TextField
        label="Student email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@uncw.edu"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        error={emailError}
        onSubmitEditing={submit}
        returnKeyType="send"
      />
      <FormError message={formError} />
      <View style={styles.switch}>
        <Text variant="caption" color="textSecondary">
          New here?{' '}
        </Text>
        <Link href="/sign-up" replace>
          <Text variant="captionStrong">Create an account</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.sm },
  switch: { flexDirection: 'row', justifyContent: 'center' },
});
