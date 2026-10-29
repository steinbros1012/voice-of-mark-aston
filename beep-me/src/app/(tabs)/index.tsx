import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Chip, EmptyState, ErrorState, LoadingState, Section, Segmented, Text, Wordmark } from '@/components/ui';
import { FontSize, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { useAuth } from '@/features/auth';
import { BeepCard, listBeeps, type DateRange } from '@/features/beeps';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@/hooks/use-query';
import { webInputReset } from '@/lib/platform';
import type { TripType } from '@/types/database';

const DATE_LABELS: Record<DateRange, string> = {
  any: 'Any day',
  today: 'Today',
  tomorrow: 'Tomorrow',
  weekend: 'This weekend',
  week: 'Next 7 days',
};
const DATE_ORDER: DateRange[] = ['any', 'today', 'tomorrow', 'weekend', 'week'];

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useAuth();
  const universityId = profile?.university_id ?? null;
  const university = UNIVERSITIES.find((u) => u.id === universityId);

  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<DateRange>('any');
  const [seats, setSeats] = useState(1);
  const [tripType, setTripType] = useState<TripType | 'any'>('any');

  const fetchUpcoming = useCallback(() => listBeeps(universityId ?? '', { tripType }), [universityId, tripType]);
  const upcoming = useQuery(fetchUpcoming, { enabled: Boolean(universityId) });

  function search() {
    router.push({
      pathname: '/search',
      params: { to: destination.trim(), date, seats: String(seats), trip: tripType },
    });
  }

  const preview = upcoming.data?.slice(0, 5) ?? [];

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={undefined}>
        <View style={styles.column}>
          <View style={styles.topBar}>
            <Wordmark />
            <View style={styles.topActions}>
              <View style={[styles.campusChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Ionicons name="school-outline" size={14} color={theme.text} />
                <Text variant="captionStrong">{university?.shortName ?? 'Campus'}</Text>
              </View>
              <Button title="Post a ride" variant="accent" size="sm" fullWidth={false} onPress={() => router.push('/post')} />
            </View>
          </View>

          <View style={styles.headline}>
            <Text variant="title" style={styles.headlineText}>
              Where are you headed?
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Your profile" onPress={() => router.push('/profile')}>
              <Avatar uri={profile?.avatar_url} name={profile?.display_name ?? 'You'} size={36} />
            </Pressable>
          </View>

          <Card flush>
            <View style={[styles.routeRow, styles.routeRowDivider, { borderBottomColor: theme.border }]}>
              <View style={[styles.dot, { backgroundColor: theme.success }]} />
              <View style={styles.routeText}>
                <Text variant="tiny" color="textMuted">
                  From
                </Text>
                <Text variant="bodyStrong">{university ? `${university.shortName} (Main Campus)` : 'Your campus'}</Text>
              </View>
            </View>
            <View style={styles.routeRow}>
              <Ionicons name="location" size={14} color={theme.danger} style={styles.pin} />
              <View style={styles.routeText}>
                <Text variant="tiny" color="textMuted">
                  To
                </Text>
                <TextInput
                  accessibilityLabel="Destination"
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Where are you going?"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="words"
                  returnKeyType="search"
                  onSubmitEditing={search}
                  style={[styles.input, { color: theme.text }, webInputReset]}
                />
              </View>
            </View>
          </Card>

          <View style={styles.pickers}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {DATE_ORDER.map((d) => (
                <Chip key={d} label={DATE_LABELS[d]} selected={date === d} icon={d === date ? 'calendar' : undefined} onPress={() => setDate(d)} />
              ))}
            </ScrollView>
            <View style={styles.seatsRow}>
              <Ionicons name="people-outline" size={18} color={theme.textSecondary} />
              <Text variant="caption" color="textSecondary" style={styles.seatsLabel}>
                Seats needed
              </Text>
              {[1, 2, 3, 4].map((n) => (
                <Chip key={n} label={String(n)} selected={seats === n} onPress={() => setSeats(n)} />
              ))}
            </View>
          </View>

          <Segmented
            options={[
              { value: 'any', label: 'All rides' },
              { value: 'local', label: 'Local' },
              { value: 'long', label: 'Going farther' },
            ]}
            value={tripType}
            onChange={setTripType}
          />

          <Button title="Search rides" onPress={search} icon="search" />

          <Section
            title="Upcoming rides"
            action={
              <Pressable accessibilityRole="button" onPress={search} hitSlop={8}>
                <Text variant="captionStrong">See all</Text>
              </Pressable>
            }>
            {upcoming.isLoading ? (
              <LoadingState label="Finding rides…" />
            ) : upcoming.error && !upcoming.data ? (
              <ErrorState description={upcoming.error} onAction={upcoming.refetch} />
            ) : preview.length === 0 ? (
              <EmptyState
                title="No rides posted yet"
                description="Driving somewhere? Post the first ride from campus."
                actionLabel="Post a ride"
                onAction={() => router.push('/post')}
              />
            ) : (
              <View style={styles.list}>
                {preview.map((beep) => (
                  <BeepCard key={beep.id} beep={beep} />
                ))}
              </View>
            )}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: Spacing.xxxl },
  column: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  campusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, minHeight: 36 },
  headline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  headlineText: { flex: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 60 },
  routeRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 2 },
  pin: { marginHorizontal: 0 },
  routeText: { flex: 1 },
  input: { fontSize: FontSize.body, paddingVertical: 2, fontWeight: '600' },
  pickers: { gap: Spacing.md },
  chipRow: { gap: Spacing.sm },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  seatsLabel: { marginRight: Spacing.xs },
  list: { gap: Spacing.md },
});
