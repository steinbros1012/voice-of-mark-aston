import { StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { UNIVERSITIES } from '@/constants/universities';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { ProfileForm } from '@/features/profile/profile-form';

export default function OnboardingScreen() {
  const { profile } = useAuth();
  const university = UNIVERSITIES.find((u) => u.id === profile?.university_id);

  return (
    <Screen>
      <View style={styles.intro}>
        <Text variant="heading">Almost there</Text>
        <Text color="textSecondary">
          {university
            ? `You are verified at ${university.shortName}. Your feed shows Beeps leaving from ${university.city}.`
            : 'Your campus is set from your .edu email.'}
        </Text>
      </View>
      {/* The root layout moves to the app once onboarding_completed_at is set. */}
      <ProfileForm submitLabel="Finish" completeOnboarding onSaved={() => undefined} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.xs },
});
