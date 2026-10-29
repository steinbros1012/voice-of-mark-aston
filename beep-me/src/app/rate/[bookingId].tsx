import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, ErrorState, FormError, LoadingState, Notice, Screen, Text, TextField } from '@/components/ui';
import { Spacing, TouchTarget } from '@/constants/theme';
import { describeAuthError, useAuth } from '@/features/auth';
import { getSeatRequest } from '@/features/requests';
import { submitReview } from '@/features/reviews';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';

const LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent'];

export default function RateRideScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const analytics = useAnalytics();
  const { user } = useAuth();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const fetchRequest = useCallback(() => getSeatRequest(bookingId), [bookingId]);
  const { data: request, error: loadError, isLoading, refetch } = useQuery(fetchRequest, { refetchOnFocus: false });

  if (isLoading) return <LoadingState />;
  if (loadError || !request) return <ErrorState description={loadError ?? 'Trip not found.'} onAction={refetch} />;

  const isDriver = request.beep.driver_id === user?.id;
  const other = isDriver ? request.rider : request.beep.driver;

  async function submit() {
    if (!user || !request) return;
    if (stars === 0) {
      setError('Tap a star to rate.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitReview({ beepId: request.beep.id, reviewerId: user.id, revieweeId: other.id, stars, text });
      analytics.track('review_submitted', { beep_id: request.beep.id, stars });
      setDone(true);
    } catch (err) {
      setError(describeAuthError(err));
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Screen footer={<Button title="Done" onPress={() => router.back()} />}>
        <Notice message={`Thanks! Your rating helps other students trust ${other.display_name}.`} tone="success" />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Submit rating" variant="accent" onPress={submit} loading={saving} />}>
      <View style={styles.person}>
        <Avatar uri={other.avatar_url} name={other.display_name} size={72} />
        <Text variant="title" align="center">
          How was your ride with {other.display_name}?
        </Text>
        <Text variant="caption" color="textSecondary" align="center">
          {request.beep.origin} → {request.beep.destination}
        </Text>
      </View>
      <View style={styles.stars} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ selected: stars === n }}
            accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
            onPress={() => setStars(n)}
            style={styles.star}>
            <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={36} color={n <= stars ? theme.warning : theme.borderStrong} />
          </Pressable>
        ))}
      </View>
      <Text variant="label" align="center" color={stars ? 'text' : 'textMuted'}>
        {stars ? LABELS[stars] : 'Tap to rate'}
      </Text>
      <TextField
        label="Anything to add? (optional)"
        value={text}
        onChangeText={(v) => setText(v.slice(0, 1000))}
        placeholder={isDriver ? 'On time, easy to coordinate with…' : 'Safe driver, clean car, good music…'}
        multiline
        counter={`${text.length}/1000`}
      />
      <Text variant="tiny" color="textMuted">
        Ratings are public on profiles. Reviews are tied to a completed ride and cannot be edited once submitted.
      </Text>
      <FormError message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  person: { alignItems: 'center', gap: Spacing.sm },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs },
  star: { width: TouchTarget + 4, height: TouchTarget + 4, alignItems: 'center', justifyContent: 'center' },
});
