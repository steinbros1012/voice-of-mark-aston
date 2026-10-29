import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, ErrorState, FormError, LoadingState, Screen, Segmented, Stepper, Text, TextField } from '@/components/ui';
import { formatCents, splitFare } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, useAuth } from '@/features/auth';
import { createBeep, DeparturePicker, getBeep, updateBeep } from '@/features/beeps';
import { useQuery } from '@/hooks/use-query';
import { useAnalytics } from '@/lib/analytics';
import type { TripType } from '@/types/database';

const MAX_PRICE_CENTS = 50000;

function validateDeparture(departure: Date | null): string | null {
  if (!departure) return 'Pick a departure day and time.';
  return departure.getTime() > Date.now() ? null : 'Pick a time in the future.';
}

function parseDollars(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export default function PostRideScreen() {
  const router = useRouter();
  const analytics = useAnalytics();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { user, profile } = useAuth();
  const university = UNIVERSITIES.find((u) => u.id === profile?.university_id);
  const editing = Boolean(edit);

  const fetchExisting = useCallback(() => (edit ? getBeep(edit) : Promise.resolve(null)), [edit]);
  const existing = useQuery(fetchExisting, { enabled: editing, refetchOnFocus: false });

  const [origin, setOrigin] = useState(university ? `${university.shortName} campus` : '');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState<Date | null>(null);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [tripType, setTripType] = useState<TripType>('long');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Prefill when editing, once the ride has loaded.
  useEffect(() => {
    const beep = existing.data;
    if (!editing || !beep || hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    setOrigin(beep.origin);
    setDestination(beep.destination);
    setDeparture(new Date(beep.departure_at));
    setSeats(beep.seats_total);
    setPrice((beep.price_per_seat_cents / 100).toString());
    setNote(beep.note ?? '');
    setTripType(beep.trip_type);
  }, [editing, existing.data, hydrated]);

  const priceCents = parseDollars(price);
  const fee = priceCents != null && priceCents >= 0 && priceCents <= MAX_PRICE_CENTS ? splitFare(priceCents) : null;
  const minSeats = editing ? Math.max(1, existing.data?.seats_taken ?? 1) : 1;

  async function submit() {
    const next: Record<string, string | null> = {
      origin: origin.trim() ? null : 'Where are you leaving from?',
      destination: destination.trim() ? null : 'Where are you headed?',
      departure: validateDeparture(departure),
      price:
        priceCents == null
          ? 'Enter a price per seat (0 is fine for a free ride).'
          : priceCents > MAX_PRICE_CENTS
            ? 'Keep it under $500 per seat.'
            : null,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    if (!user || !profile?.university_id || !departure || priceCents == null) return;

    setFormError(null);
    setSubmitting(true);
    const input = {
      origin: origin.trim(),
      destination: destination.trim(),
      departure_at: departure.toISOString(),
      seats_total: seats,
      price_per_seat_cents: priceCents,
      note: note.trim() || null,
      trip_type: tripType,
    };
    try {
      if (editing && edit) {
        await updateBeep(edit, input);
        router.back();
      } else {
        const beep = await createBeep(user.id, profile.university_id, input);
        analytics.track('beep_posted', { beep_id: beep.id, price_per_seat_cents: priceCents, seats_total: seats });
        router.replace({ pathname: '/beep/[id]', params: { id: beep.id } });
      }
    } catch (error) {
      setFormError(describeAuthError(error));
      setSubmitting(false);
    }
  }

  if (profile && !profile.edu_verified) {
    return (
      <Screen>
        <ErrorState title="Verify first" description="Only verified students can post rides. Check your .edu inbox for the code." />
      </Screen>
    );
  }
  if (editing && existing.isLoading) return <LoadingState />;
  if (editing && (existing.error || !existing.data)) {
    return (
      <Screen>
        <ErrorState description={existing.error ?? 'This ride could not be found.'} onAction={existing.refetch} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: editing ? 'Edit ride' : 'Post a ride' }} />
      <Screen footer={<Button title={editing ? 'Save changes' : 'Post ride'} variant="accent" onPress={submit} loading={submitting} />}>
        <View style={styles.intro}>
          <Text variant="title">{editing ? 'Update your ride' : 'Offer seats on your trip'}</Text>
          <Text variant="caption" color="textSecondary">
            Riders on your campus see this and request seats. You choose who comes along.
          </Text>
        </View>

        <Segmented
          options={[
            { value: 'local', label: 'Around town' },
            { value: 'long', label: 'Going farther' },
          ]}
          value={tripType}
          onChange={setTripType}
        />

        <TextField label="Leaving from" icon="radio-button-on" value={origin} onChangeText={setOrigin} placeholder="UNCW Library" autoCapitalize="words" error={errors.origin} />
        <TextField label="Going to" icon="location-outline" value={destination} onChangeText={setDestination} placeholder="Raleigh Union Station" autoCapitalize="words" error={errors.destination} />
        <DeparturePicker value={departure} onChange={setDeparture} error={errors.departure} />
        <Stepper
          label="Seats available"
          value={seats}
          min={minSeats}
          max={8}
          onChange={setSeats}
          hint={editing && minSeats > 1 ? `${minSeats} already booked` : undefined}
        />
        <TextField
          label="Price per seat"
          icon="cash-outline"
          value={price}
          onChangeText={setPrice}
          placeholder="20"
          keyboardType="decimal-pad"
          error={errors.price}
          hint={
            fee
              ? `Riders pay ${formatCents(fee.totalCents)} a seat. You receive ${formatCents(fee.driverPayoutCents)} after the 15% Beep Me fee.`
              : 'Beep Me keeps 15% of each seat. Set 0 for a free ride.'
          }
        />
        <TextField
          label="Note for riders (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Meeting at the Fisher lot. Room for one bag each."
          multiline
          maxLength={500}
          counter={`${note.length}/500`}
        />
        <FormError message={formError} />
        {editing ? (
          <Card>
            <Text variant="caption" color="textSecondary">
              Riders with accepted seats keep them. Seats can&apos;t go below what is already booked.
            </Text>
          </Card>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({ intro: { gap: Spacing.xs } });
