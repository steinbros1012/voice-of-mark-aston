import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  describeAuthError,
  useAuth,
  validateDisplayName,
  validateEduEmail,
  validatePassword,
} from '@/features/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const next = {
      name: validateDisplayName(displayName),
      email: validateEduEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const result = await signUp({ email, password, displayName });
      if (result.kind === 'needsVerification') {
        router.replace({ pathname: '/verify-email', params: { email: result.email } });
      } else if (result.kind === 'alreadyRegistered') {
        setFormError('That email already has an account. Log in instead.');
      }
      // 'signedIn' is handled by the root layout's guards.
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text variant="heading">Join your campus</Text>
        <Text color="textSecondary">
          Sign up with your university email. We email you a code to prove you are a student.
        </Text>
      </View>
      <TextField
        label="Name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="First name and last initial"
        autoCapitalize="words"
        textContentType="name"
        error={errors.name}
      />
      <TextField
        label="University email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@uncw.edu"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.email}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        textContentType="newPassword"
        error={errors.password}
        onSubmitEditing={submit}
      />
      <FormError message={formError} />
      <Button title="Send my code" onPress={submit} loading={submitting} />
      <Link href="/sign-in" style={styles.switch}>
        <Text variant="caption" color="textSecondary">
          Already have an account? <Text variant="label" color="primary">Log in</Text>
        </Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
  switch: { alignSelf: 'center', marginTop: Spacing.sm },
});
