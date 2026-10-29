import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth, validateEmail } from '@/features/auth';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const problem = validateEmail(email);
    setEmailError(problem);
    if (problem) return;
    if (!password) {
      setFormError('Enter your password.');
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const result = await signIn({ email, password });
      if (result.kind === 'needsVerification') {
        router.replace({ pathname: '/verify-email', params: { email: result.email, resend: '1' } });
      }
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text variant="heading">Welcome back</Text>
      </View>
      <TextField
        label="University email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@uncw.edu"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        error={emailError}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        onSubmitEditing={submit}
      />
      <FormError message={formError} />
      <Button title="Log in" onPress={submit} loading={submitting} />
      <Link href="/sign-up" style={styles.switch}>
        <Text variant="caption" color="textSecondary">
          New here? <Text variant="label" color="primary">Create an account</Text>
        </Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
  switch: { alignSelf: 'center', marginTop: Spacing.sm },
});
