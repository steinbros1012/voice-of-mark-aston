import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';

export default function BeepDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen
      title="Beep detail"
      description={`Route, time, seats left, price and the driver for Beep ${id}. Request a seat or share it.`}
      phase={3}
      icon="navigate-outline"
    />
  );
}
