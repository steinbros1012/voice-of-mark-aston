import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Segmented, Stepper, Text, TextField } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { useAuth } from '@/features/auth';
import { BeepList, listBeeps, type DateRange, type TimeOfDay } from '@/features/beeps';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import type { TripType } from '@/types/database';

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

type Filters = { date: DateRange; timeOfDay: TimeOfDay; maxPriceCents: number | null; seats: number; tripType: TripType | 'any' };

function parseTrip(value: string | undefined): TripType | 'any' {
  return value === 'local' || value === 'long' ? value : 'any';
}

function parseDate(value: string | undefined): DateRange {
  return DATE_OPTIONS.some((o) => o.value === value) ? (value as DateRange) : 'any';
}

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ to?: string; date?: string; seats?: string; trip?: string }>();
  const { profile } = useAuth();
  const universityId = profile?.university_id ?? '';
  const university = UNIVERSITIES.find((u) => u.id === universityId);

  const [destination, setDestination] = useState(params.to ?? '');
  const [debouncedDestination, setDebouncedDestination] = useState(params.to ?? '');
  const [filters, setFilters] = useState<Filters>({
    date: parseDate(params.date),
    timeOfDay: 'any',
    maxPriceCents: null,
    seats: Math.min(8, Math.max(1, Number(params.seats) || 1)),
    tripType: parseTrip(params.trip),
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDestination(destination.trim()), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const fetchResults = useCallback(
    () => listBeeps(universityId, { destination: debouncedDestination, ...filters }),
    [universityId, debouncedDestination, filters],
  );
  const query = useQuery(fetchResults, { enabled: Boolean(universityId) });

  const activeCount = [filters.timeOfDay !== 'any', filters.maxPriceCents != null, filters.seats > 1, filters.tripType !== 'any'].filter(Boolean).length;
  const dateLabel = DATE_OPTIONS.find((o) => o.value === filters.date)?.label ?? 'Any day';
  const found = query.data?.length;

  function openSheet() {
    setDraft(filters);
    setSheetOpen(true);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: debouncedDestination ? `${university?.city ?? 'Campus'} → ${debouncedDestination}` : 'Find a ride',
        }}
      />
      <BeepList
        query={query}
        header={
          <View style={styles.header}>
            <TextField
              icon="search"
              value={destination}
              onChangeText={setDestination}
              placeholder="Raleigh, Charlotte, the airport…"
              autoCapitalize="words"
              returnKeyType="search"
              accessibilityLabel="Destination"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label={dateLabel} icon="calendar-outline" dropdown selected={filters.date !== 'any'} onPress={openSheet} />
              <Chip
                label={TIME_OPTIONS.find((o) => o.value === filters.timeOfDay)?.label ?? 'Time'}
                icon="time-outline"
                dropdown
                selected={filters.timeOfDay !== 'any'}
                onPress={openSheet}
              />
              <Chip
                label={PRICE_OPTIONS.find((o) => o.value === filters.maxPriceCents)?.label ?? 'Price'}
                icon="pricetag-outline"
                dropdown
                selected={filters.maxPriceCents != null}
                onPress={openSheet}
              />
              <Chip label={`${filters.seats} seat${filters.seats === 1 ? '' : 's'}`} icon="people-outline" dropdown selected={filters.seats > 1} onPress={openSheet} />
            </ScrollView>
            <View style={styles.countRow}>
              <Text variant="caption" color="textSecondary">
                {found == null ? ' ' : `${found} ride${found === 1 ? '' : 's'} found`}
              </Text>
              <Pressable accessibilityRole="button" onPress={openSheet} hitSlop={8} style={styles.filterLink}>
                <Ionicons name="options-outline" size={16} color={theme.text} />
                <Text variant="captionStrong">Filters{activeCount ? ` (${activeCount})` : ''}</Text>
              </Pressable>
            </View>
          </View>
        }
        emptyTitle="No rides match"
        emptyDescription="Try another destination or widen the day, time and price filters."
        emptyActionLabel="Clear filters"
        onEmptyAction={() => {
          setDestination('');
          setFilters({ date: 'any', timeOfDay: 'any', maxPriceCents: null, seats: 1, tripType: 'any' });
        }}
      />

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: theme.overlay }]} onPress={() => setSheetOpen(false)} accessibilityLabel="Close filters" />
        <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.sheetInner}>
            <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />
            <View style={styles.sheetHeader}>
              <Text variant="title">Filters</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSheetOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
              <Text variant="label">Day</Text>
              <View style={styles.wrap}>
                {DATE_OPTIONS.map((o) => (
                  <Chip key={o.value} label={o.label} selected={draft.date === o.value} onPress={() => setDraft({ ...draft, date: o.value })} />
                ))}
              </View>
              <Text variant="label">Departure time</Text>
              <View style={styles.wrap}>
                {TIME_OPTIONS.map((o) => (
                  <Chip key={o.value} label={o.label} selected={draft.timeOfDay === o.value} onPress={() => setDraft({ ...draft, timeOfDay: o.value })} />
                ))}
              </View>
              <Text variant="label">Maximum price (per seat)</Text>
              <View style={styles.wrap}>
                {PRICE_OPTIONS.map((o) => (
                  <Chip key={o.label} label={o.label} selected={draft.maxPriceCents === o.value} onPress={() => setDraft({ ...draft, maxPriceCents: o.value })} />
                ))}
              </View>
              <Stepper label="Seats needed" value={draft.seats} min={1} max={8} onChange={(seats) => setDraft({ ...draft, seats })} />
              <Text variant="label">Trip type</Text>
              <Segmented
                options={[
                  { value: 'any', label: 'All' },
                  { value: 'local', label: 'Local' },
                  { value: 'long', label: 'Going farther' },
                ]}
                value={draft.tripType}
                onChange={(tripType) => setDraft({ ...draft, tripType })}
              />
            </ScrollView>
            <View style={styles.sheetActions}>
              <Button
                title="Reset"
                variant="secondary"
                fullWidth={false}
                onPress={() => setDraft({ date: 'any', timeOfDay: 'any', maxPriceCents: null, seats: 1, tripType: 'any' })}
              />
              <Button
                title="Show rides"
                variant="accent"
                style={styles.showButton}
                onPress={() => {
                  setFilters(draft);
                  setSheetOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  chips: { gap: Spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterLink: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32 },
  backdrop: { flex: 1 },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingTop: Spacing.sm, maxHeight: '85%', alignItems: 'center' },
  sheetInner: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetBody: { gap: Spacing.md, paddingBottom: Spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sheetActions: { flexDirection: 'row', gap: Spacing.md, paddingTop: Spacing.sm },
  showButton: { flex: 1 },
});
