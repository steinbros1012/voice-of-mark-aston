import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function RateRideScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <PlaceholderScreen
      title="Rate your ride"
      description={`Stars and a short review for the other person on booking ${bookingId}.`}
      phase={5}
      icon="star-outline"
    />
  );
}
