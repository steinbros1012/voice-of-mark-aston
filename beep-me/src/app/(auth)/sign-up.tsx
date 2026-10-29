import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, ProgressSteps, Screen, Text, TextField } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES, findUniversityByEmail } from '@/constants/universities';
import { describeAuthError, useAuth, validateEduEmail } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { requestCode } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const campus = findUniversityByEmail(email) ?? UNIVERSITIES[0];

  async function submit() {
    const problem = validateEduEmail(email);
    setEmailError(problem);
    if (problem) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await requestCode({ email, createAccount: true });
      router.push({ pathname: '/verify-email', params: { email: email.trim().toLowerCase(), mode: 'signup' } });
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      footer={
        <Button title="Send verification code" variant="accent" onPress={submit} loading={submitting} />
      }>
      <ProgressSteps step={2} total={3} />
      <View style={styles.intro}>
        <Text variant="display">Find your campus</Text>
        <Text color="textSecondary">Verify your student email to join your campus.</Text>
      </View>

      <View>
        <Text variant="label" style={styles.label}>
          Campus
        </Text>
        <View style={[styles.campus, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.campusIcon, { backgroundColor: theme.surfaceMuted }]}>
            <Ionicons name="school-outline" size={18} color={theme.text} />
          </View>
          <View style={styles.campusText}>
            <Text variant="bodyStrong">{campus?.name}</Text>
            <Text variant="caption" color="textSecondary">
              Only campus open right now
            </Text>
          </View>
        </View>
      </View>

      <TextField
        label="Student email"
        value={email}
        onChangeText={setEmail}
        placeholder={`you@${campus?.domains[0] ?? 'uncw.edu'}`}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        error={emailError}
        hint={`We'll send a verification code to your student email (${campus?.domains[0] ?? 'uncw.edu'}) to confirm you're a student.`}
        onSubmitEditing={submit}
        returnKeyType="send"
      />
      <FormError message={formError} />
      <View style={styles.switch}>
        <Text variant="caption" color="textSecondary">
          Already have an account?{' '}
        </Text>
        <Link href="/sign-in" replace>
          <Text variant="captionStrong">Log in</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.sm },
  label: { marginBottom: Spacing.sm },
  campus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  campusIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  campusText: { flex: 1 },
  switch: { flexDirection: 'row', justifyContent: 'center' },
});
