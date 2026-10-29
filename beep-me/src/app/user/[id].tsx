import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen
      title="Student profile"
      description={`Public profile, rating and reviews for user ${id}. Report or block from here.`}
      phase={5}
      icon="person-circle-outline"
    />
  );
}
