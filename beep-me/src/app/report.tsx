import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, FormError, Notice, Screen, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { REPORT_REASONS, submitReport } from '@/features/safety';
import type { ReportReason } from '@/types/database';

export default function ReportScreen() {
  const router = useRouter();
  const { userId, beepId } = useLocalSearchParams<{ userId?: string; beepId?: string }>();
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!user) return;
    if (!reason) {
      setError('Pick a reason.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({ reporterId: user.id, userId: userId ?? null, beepId: beepId ?? null, reason, details });
      setDone(true);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Screen footer={<Button title="Done" onPress={() => router.back()} />}>
        <Notice message="Thanks. Our team reviews every report. If you feel unsafe right now, contact campus police or 911." tone="success" />
        <Text variant="caption" color="textSecondary">
          You can also block this person from their profile so you no longer see each other&apos;s rides.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Submit report" variant="accent" onPress={submit} loading={submitting} />}>
      <View style={styles.intro}>
        <Text variant="title">{beepId ? 'Report this ride' : 'Report this student'}</Text>
        <Text variant="caption" color="textSecondary">
          Reports are private. The person you report is not told who filed it.
        </Text>
      </View>
      <Text variant="label">What happened?</Text>
      <View style={styles.reasons}>
        {REPORT_REASONS.map((r) => (
          <Chip key={r.value} label={r.label} selected={reason === r.value} onPress={() => setReason(r.value)} />
        ))}
      </View>
      <TextField
        label="Details (optional)"
        value={details}
        onChangeText={(v) => setDetails(v.slice(0, 2000))}
        placeholder="Tell us what happened, with dates and places if you can."
        multiline
        counter={`${details.length}/2000`}
      />
      <FormError message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
