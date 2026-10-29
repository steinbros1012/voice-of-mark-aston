import { StyleSheet, View } from 'react-native';

import { ProgressSteps, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ProfileForm } from '@/features/profile/profile-form';

export default function OnboardingScreen() {
  return (
    <Screen edges={['top']}>
      <ProgressSteps step={3} total={3} />
      <View style={styles.intro}>
        <Text variant="display">Let&apos;s get you ready</Text>
        <Text color="textSecondary">Add a few details so other students know who you are.</Text>
      </View>
      {/* The root layout moves to the app once onboarding_completed_at is set. */}
      <ProfileForm submitLabel="Continue" completeOnboarding onSaved={() => undefined} />
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: Spacing.sm } });
