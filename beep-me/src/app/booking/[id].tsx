import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen
      title="Booking"
      description={`Status, payment and the driver-rider chat for booking ${id}.`}
      phase={4}
      icon="chatbubbles-outline"
    />
  );
}
