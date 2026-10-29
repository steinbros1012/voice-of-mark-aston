import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text variant="title">Beep Me</Text>
        <Text variant="subheading" color="textSecondary">
          Rides by students, for students. Post a Beep or grab a seat.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button title="Sign up with your .edu email" onPress={() => router.push('/sign-up')} />
        <Button title="I already have an account" variant="secondary" onPress={() => router.push('/sign-in')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  actions: { gap: Spacing.sm },
});
