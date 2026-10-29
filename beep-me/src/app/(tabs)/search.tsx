import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { BeepList, listBeeps, type DateRange, type TimeOfDay } from '@/features/beeps';
import { useQuery } from '@/hooks/use-query';

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'any', label: 'Any day' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'Next 7 days' },
];

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const PRICE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Any price' },
  { value: 1000, label: 'Under $10' },
  { value: 2000, label: 'Under $20' },
  { value: 4000, label: 'Under $40' },
];

function ChipRow<T>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((opt) => (
        <Chip key={opt.label} label={opt.label} selected={opt.value === value} onPress={() => onChange(opt.value)} />
      ))}
    </ScrollView>
  );
}

export default function SearchScreen() {
  const { profile } = useAuth();
  const universityId = profile?.university_id ?? '';
  const [destination, setDestination] = useState('');
  const [debouncedDestination, setDebouncedDestination] = useState('');
  const [date, setDate] = useState<DateRange>('any');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');
  const [maxPriceCents, setMaxPriceCents] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDestination(destination.trim()), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const fetchResults = useCallback(
    () => listBeeps(universityId, { destination: debouncedDestination, date, timeOfDay, maxPriceCents }),
    [universityId, debouncedDestination, date, timeOfDay, maxPriceCents],
  );
  const query = useQuery(fetchResults, { enabled: Boolean(universityId) });

  return (
    <BeepList
      query={query}
      header={
        <View style={styles.filters}>
          <TextField
            label="Where to?"
            value={destination}
            onChangeText={setDestination}
            placeholder="Raleigh, Charlotte, the airport…"
            autoCapitalize="words"
            returnKeyType="search"
          />
          <Text variant="label">When</Text>
          <ChipRow options={DATE_OPTIONS} value={date} onChange={setDate} />
          <ChipRow options={TIME_OPTIONS} value={timeOfDay} onChange={setTimeOfDay} />
          <Text variant="label">Price per seat</Text>
          <ChipRow options={PRICE_OPTIONS} value={maxPriceCents} onChange={setMaxPriceCents} />
        </View>
      }
      emptyTitle="No rides match"
      emptyDescription="Try another destination or widen the day and price filters."
    />
  );
}

const styles = StyleSheet.create({
  filters: { gap: Spacing.sm, paddingBottom: Spacing.md },
  chips: { gap: Spacing.sm },
});
