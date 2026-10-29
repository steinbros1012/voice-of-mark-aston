import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen, Text } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen contentStyle={styles.center}>
        <Text variant="heading">This ride left without us.</Text>
        <Text color="textSecondary">The screen you asked for does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="label" color="primary">
            Back to the feed
          </Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  link: { marginTop: 8 },
});
