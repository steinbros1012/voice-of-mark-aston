import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, FormError, ListRow, Screen, Text, VerifiedPill } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, useAuth } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="heading">{value}</Text>
      <Text variant="tiny" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile, user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const university = UNIVERSITIES.find((u) => u.id === profile?.university_id);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(describeAuthError(err));
      setSigningOut(false);
    }
  }

  if (!profile) {
    return (
      <Screen edges={['top']} contentStyle={styles.center}>
        <Text color="textSecondary" align="center">
          We couldn&apos;t load your profile.
        </Text>
        <Button title="Log out" variant="secondary" onPress={handleSignOut} loading={signingOut} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.titleRow}>
        <Text variant="display">Profile</Text>
        <Button title="Edit" variant="secondary" size="sm" fullWidth={false} icon="create-outline" onPress={() => router.push('/edit-profile')} />
      </View>

      <Card>
        <View style={styles.header}>
          <Avatar uri={profile.avatar_url} name={profile.display_name} size={72} />
          <View style={styles.headerText}>
            <Text variant="title">{profile.display_name}</Text>
            <Text variant="caption" color="textSecondary">
              {university?.name ?? 'Campus not set'}
            </Text>
            {profile.edu_verified ? <VerifiedPill /> : null}
          </View>
        </View>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        <View style={[styles.stats, { borderTopColor: theme.border }]}>
          <Stat label="Rating" value={profile.average_rating ? profile.average_rating.toFixed(1) : '–'} />
          <Stat label="Reviews" value={String(profile.rating_count)} />
          <Stat label="Rides given" value={String(profile.rides_given)} />
          <Stat label="Rides taken" value={String(profile.rides_taken)} />
        </View>
      </Card>

      <Card flush style={styles.rows}>
        <ListRow icon="star-outline" title="Ratings and reviews" subtitle="What riders and drivers say about you" onPress={() => router.push({ pathname: '/user/[id]', params: { id: profile.id } })} />
        <ListRow icon="car-outline" title="Your rides" subtitle="Rides you're driving and their requests" onPress={() => router.push('/trips')} />
        <ListRow icon="wallet-outline" title="Payments and earnings" subtitle="Coming with in-app payments (next release)" />
        <ListRow icon="sparkles-outline" title="Beep Me Plus" subtitle="Premium placement for drivers, no booking fees for riders" onPress={() => router.push('/paywall')} last />
      </Card>

      <Card flush style={styles.rows}>
        <ListRow icon="help-circle-outline" title="Help and safety" onPress={() => router.push('/help')} />
        <ListRow icon="mail-outline" title={user?.email ?? ''} subtitle="Verified student email" last />
      </Card>

      <FormError message={error} />
      <Button title="Log out" variant="ghost" icon="log-out-outline" onPress={handleSignOut} loading={signingOut} />
      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
        <Text variant="tiny" color="textMuted" style={styles.footerText}>
          Student email verification confirms a campus address only. It is not a background check.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', gap: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerText: { flex: 1, gap: 4 },
  bio: { marginTop: Spacing.md },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { alignItems: 'center', gap: 2, flex: 1 },
  rows: { paddingHorizontal: Spacing.lg },
  footer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, paddingHorizontal: Spacing.sm },
  footerText: { flex: 1 },
});
