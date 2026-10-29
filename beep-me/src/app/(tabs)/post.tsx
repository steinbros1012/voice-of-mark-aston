import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, FormError, Screen, Stepper, Text, TextField } from '@/components/ui';
import { formatCents, splitFare } from '@/constants/fees';
import { Spacing } from '@/constants/theme';
import { UNIVERSITIES } from '@/constants/universities';
import { describeAuthError, useAuth } from '@/features/auth';
import { createBeep, DeparturePicker } from '@/features/beeps';
import { useAnalytics } from '@/lib/analytics';

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

export default function PostBeepScreen() {
  const router = useRouter();
  const analytics = useAnalytics();
  const { user, profile } = useAuth();
  const university = UNIVERSITIES.find((u) => u.id === profile?.university_id);

  const [origin, setOrigin] = useState(university ? `${university.shortName} campus` : '');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState<Date | null>(null);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const priceCents = parseDollars(price);
  const fee = priceCents != null && priceCents >= 0 && priceCents <= MAX_PRICE_CENTS ? splitFare(priceCents) : null;

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
    try {
      const beep = await createBeep(user.id, profile.university_id, {
        origin: origin.trim(),
        destination: destination.trim(),
        departure_at: departure.toISOString(),
        seats_total: seats,
        price_per_seat_cents: priceCents,
        note: note.trim() || null,
      });
      analytics.track('beep_posted', { beep_id: beep.id, price_per_seat_cents: priceCents, seats_total: seats });
      setDestination('');
      setDeparture(null);
      setPrice('');
      setNote('');
      router.push({ pathname: '/beep/[id]', params: { id: beep.id } });
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (profile && !profile.edu_verified) {
    return (
      <Screen contentStyle={styles.center}>
        <Text variant="heading">Verify first</Text>
        <Text color="textSecondary">Only verified students can post rides. Check your .edu inbox for the code.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <TextField
        label="Leaving from"
        value={origin}
        onChangeText={setOrigin}
        placeholder="Fisher Student Center"
        autoCapitalize="words"
        error={errors.origin}
      />
      <TextField
        label="Going to"
        value={destination}
        onChangeText={setDestination}
        placeholder="Raleigh"
        autoCapitalize="words"
        error={errors.destination}
      />
      <DeparturePicker value={departure} onChange={setDeparture} error={errors.departure} />
      <Stepper label="Seats available" value={seats} min={1} max={8} onChange={setSeats} />
      <TextField
        label="Price per seat"
        value={price}
        onChangeText={setPrice}
        placeholder="$20"
        keyboardType="decimal-pad"
        error={errors.price}
        hint={
          fee
            ? `Riders pay ${formatCents(fee.totalCents)}. You receive ${formatCents(fee.driverPayoutCents)} after the 15% Beep Me fee.`
            : 'Beep Me keeps 15% of each seat.'
        }
      />
      <TextField
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="Leaving from the Fisher lot, room for one bag each, no smoking."
        multiline
        maxLength={500}
        style={styles.note}
      />
      <FormError message={formError} />
      <View style={styles.submit}>
        <Button title="Post Beep" onPress={submit} loading={submitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', gap: Spacing.sm },
  note: { minHeight: 96, paddingTop: Spacing.sm, textAlignVertical: 'top' },
  submit: { paddingBottom: Spacing.lg },
});
