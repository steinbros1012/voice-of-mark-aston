import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, EmptyState, ErrorState, FormError, LoadingState, Screen, Section, Text, VerifiedPill } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, useAuth } from '@/features/auth';
import { getPublicProfile, listReviewsFor } from '@/features/reviews';
import { blockUser, isBlocked, unblockUser } from '@/features/safety';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { formatDepartureDay, formatMonthYear, pluralize } from '@/lib/format';

function confirmBlock(name: string, onConfirm: () => void) {
  const title = `Block ${name}?`;
  const message = 'You will not see each other\'s rides or requests. You can unblock from their profile.';
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Block', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isMe = user?.id === id;

  const fetchProfile = useCallback(() => getPublicProfile(id), [id]);
  const profile = useQuery(fetchProfile);
  const fetchReviews = useCallback(() => listReviewsFor(id), [id]);
  const reviews = useQuery(fetchReviews);
  const fetchBlocked = useCallback(() => (user && !isMe ? isBlocked(user.id, id) : Promise.resolve(false)), [user, id, isMe]);
  const blocked = useQuery(fetchBlocked, { enabled: Boolean(user) });

  if (profile.isLoading) return <LoadingState />;
  if (profile.error || !profile.data) return <ErrorState description={profile.error ?? 'Profile not found.'} onAction={profile.refetch} />;

  const p = profile.data;
  const university = UNIVERSITIES.find((u) => u.id === p.university_id);

  async function toggleBlock() {
    if (!user) return;
    setBusy(true);
    setActionError(null);
    try {
      if (blocked.data) await unblockUser(user.id, id);
      else await blockUser(user.id, id);
      await blocked.refetch();
    } catch (err) {
      setActionError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: isMe ? 'Your public profile' : p.display_name }} />
      <Screen>
        <Card>
          <View style={styles.header}>
            <Avatar uri={p.avatar_url} name={p.display_name} size={72} />
            <View style={styles.headerText}>
              <Text variant="title">{p.display_name}</Text>
              <Text variant="caption" color="textSecondary">
                {university?.shortName ?? 'Campus'} · Joined {formatMonthYear(p.created_at)}
              </Text>
              {p.edu_verified ? <VerifiedPill /> : null}
            </View>
          </View>
          {p.bio ? <Text style={styles.bio}>{p.bio}</Text> : null}
          <View style={[styles.stats, { borderTopColor: theme.border }]}>
            <View style={styles.stat}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={theme.warning} />
                <Text variant="heading">{p.average_rating ? p.average_rating.toFixed(1) : '–'}</Text>
              </View>
              <Text variant="tiny" color="textSecondary">
                {pluralize(p.rating_count, 'review')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="heading">{p.rides_given}</Text>
              <Text variant="tiny" color="textSecondary">
                Rides given
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="heading">{p.rides_taken}</Text>
              <Text variant="tiny" color="textSecondary">
                Rides taken
              </Text>
            </View>
          </View>
        </Card>

        <Text variant="tiny" color="textMuted">
          Student email verification confirms a campus address. It is not a background check.
        </Text>

        <Section title="Reviews">
          {reviews.isLoading ? (
            <LoadingState />
          ) : reviews.error && !reviews.data ? (
            <ErrorState description={reviews.error} onAction={reviews.refetch} />
          ) : (reviews.data?.length ?? 0) === 0 ? (
            <EmptyState title="No reviews yet" description="Reviews appear after completed rides." icon="star-outline" />
          ) : (
            <View style={styles.reviews}>
              {reviews.data!.map((r) => (
                <Card key={r.id}>
                  <View style={styles.reviewTop}>
                    <Avatar uri={r.reviewer.avatar_url} name={r.reviewer.display_name} size={28} />
                    <Text variant="captionStrong" style={styles.reviewer}>
                      {r.reviewer.display_name}
                    </Text>
                    <View style={styles.ratingRow}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Ionicons key={i} name={i < r.stars ? 'star' : 'star-outline'} size={14} color={theme.warning} />
                      ))}
                    </View>
                  </View>
                  {r.text ? <Text variant="caption">{r.text}</Text> : null}
                  <Text variant="tiny" color="textMuted">
                    {formatDepartureDay(r.created_at)}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </Section>

        {!isMe ? (
          <View style={styles.safety}>
            <FormError message={actionError} />
            <Button title="Report" variant="secondary" icon="flag-outline" onPress={() => router.push({ pathname: '/report', params: { userId: id } })} />
            <Button
              title={blocked.data ? 'Unblock' : 'Block'}
              variant={blocked.data ? 'secondary' : 'danger'}
              icon={blocked.data ? 'lock-open-outline' : 'ban-outline'}
              loading={busy}
              onPress={() => (blocked.data ? toggleBlock() : confirmBlock(p.display_name, toggleBlock))}
            />
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerText: { flex: 1, gap: 4 },
  bio: { marginTop: Spacing.md },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { alignItems: 'center', gap: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviews: { gap: Spacing.md },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  reviewer: { flex: 1 },
  safety: { gap: Spacing.sm },
});
