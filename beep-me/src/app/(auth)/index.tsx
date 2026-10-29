import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text, Wordmark } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.top}>
        <Wordmark size="lg" />
      </View>
      <View style={styles.hero}>
        <View style={styles.illustration} accessibilityElementsHidden>
          {(['school-outline', 'car-outline', 'location-outline'] as const).map((icon, i) => (
            <View key={icon} style={styles.illustrationStep}>
              <View style={[styles.illustrationIcon, { backgroundColor: i === 1 ? theme.accent : theme.surface, borderColor: theme.border }]}>
                <Ionicons name={icon} size={22} color={theme.text} />
              </View>
              {i < 2 ? <View style={[styles.illustrationLine, { backgroundColor: theme.borderStrong }]} /> : null}
            </View>
          ))}
        </View>
        <Text variant="display">Your campus.{'\n'}Your people.{'\n'}Your ride.</Text>
        <Text color="textSecondary">
          A student-to-student rideshare marketplace for the UNCW community and beyond.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button title="Sign up with email" icon="mail-outline" onPress={() => router.push('/sign-up')} />
        <View style={styles.loginRow}>
          <Text variant="caption" color="textSecondary">
            Already have an account?{' '}
          </Text>
          <Link href="/sign-in" accessibilityRole="link">
            <Text variant="captionStrong">Log in</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', paddingHorizontal: Spacing.xxl },
  top: { alignItems: 'center', paddingTop: Spacing.xxl },
  hero: { gap: Spacing.lg },
  illustration: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  illustrationStep: { flexDirection: 'row', alignItems: 'center' },
  illustrationIcon: { width: 48, height: 48, borderRadius: Radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  illustrationLine: { width: 36, height: 2, marginHorizontal: 6, borderRadius: 1 },
  actions: { gap: Spacing.lg, paddingBottom: Spacing.sm },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
