import { Stack, useRouter } from 'expo-router';

import { EmptyState, Screen } from '@/components/ui';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen scroll={false}>
        <EmptyState title="This ride left without us" description="The screen you asked for does not exist." icon="help-circle-outline" actionLabel="Back to Explore" onAction={() => router.replace('/')} />
      </Screen>
    </>
  );
}
