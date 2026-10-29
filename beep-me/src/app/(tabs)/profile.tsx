import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Button, FormError, Screen, Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, useAuth } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface }]}>
      <Text variant="subheading">{value}</Text>
      <Text variant="caption" color="textSecondary">
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
      <Screen contentStyle={styles.center}>
        <Text color="textSecondary">We could not load your profile.</Text>
        <Button title="Log out" variant="secondary" onPress={handleSignOut} loading={signingOut} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar uri={profile.avatar_url} name={profile.display_name} size={88} />
        <Text variant="heading">{profile.display_name}</Text>
        <View style={styles.badges}>
          {profile.edu_verified ? (
            <View style={[styles.badge, { backgroundColor: theme.surface }]}>
              <Ionicons name="shield-checkmark" size={14} color={theme.success} />
              <Text variant="caption">Verified {university?.shortName ?? 'student'}</Text>
            </View>
          ) : null}
          <Text variant="caption" color="textSecondary">
            {user?.email}
          </Text>
        </View>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      </View>

      <View style={styles.stats}>
        <Stat label="Rating" value={profile.average_rating ? profile.average_rating.toFixed(1) : '–'} />
        <Stat label="Rides given" value={String(profile.rides_given)} />
        <Stat label="Rides taken" value={String(profile.rides_taken)} />
      </View>

      <View style={styles.section}>
        <Text variant="subheading">Reviews</Text>
        <Text color="textSecondary">
          {profile.rating_count === 0
            ? 'No reviews yet. They show up here after your first ride.'
            : `${profile.rating_count} review${profile.rating_count === 1 ? '' : 's'} (listing arrives in Phase 5).`}
        </Text>
      </View>

      <FormError message={error} />
      <Button title="Edit profile" variant="secondary" onPress={() => router.push('/edit-profile')} />
      <Button title="Log out" variant="ghost" onPress={handleSignOut} loading={signingOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', gap: Spacing.md },
  header: { alignItems: 'center', gap: Spacing.sm },
  badges: { alignItems: 'center', gap: Spacing.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  bio: { textAlign: 'center' },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md },
  section: { gap: Spacing.xs },
});
