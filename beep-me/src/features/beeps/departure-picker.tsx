import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatDepartureDay, formatTime } from '@/lib/format';

const DAYS_AHEAD = 14;
const SLOT_MINUTES = 30;

type DeparturePickerProps = {
  value: Date | null;
  onChange: (next: Date) => void;
  error?: string | null;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/**
 * Departure date and time without a native picker: the next two weeks as day
 * chips, then half-hour slots for the chosen day. Works the same on iOS,
 * Android and web.
 */
export function DeparturePicker({ value, onChange, error }: DeparturePickerProps) {
  const now = useMemo(() => new Date(), []);
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = startOfDay(now);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [now],
  );
  const selectedDay = value ? startOfDay(value) : null;

  const slots = useMemo(() => {
    if (!selectedDay) return [];
    const list: Date[] = [];
    for (let minutes = 5 * 60; minutes < 24 * 60; minutes += SLOT_MINUTES) {
      const slot = new Date(selectedDay);
      slot.setMinutes(minutes);
      // Hide slots already in the past for today.
      if (slot.getTime() > now.getTime() + 15 * 60 * 1000) list.push(slot);
    }
    return list;
  }, [selectedDay, now]);

  function pickDay(day: Date) {
    const next = new Date(day);
    if (value) next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    else next.setHours(17, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      // Earliest slot for today.
      const first = slots[0];
      next.setHours(first ? first.getHours() : 23, first ? first.getMinutes() : 30, 0, 0);
    }
    onChange(next);
  }

  return (
    <View style={styles.wrapper}>
      <Text variant="label">Leaving</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {days.map((day) => (
          <Chip
            key={day.toISOString()}
            label={formatDepartureDay(day, now)}
            selected={selectedDay ? sameDay(day, selectedDay) : false}
            onPress={() => pickDay(day)}
          />
        ))}
      </ScrollView>
      {selectedDay ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {slots.map((slot) => (
            <Chip
              key={slot.toISOString()}
              label={formatTime(slot)}
              selected={value?.getTime() === slot.getTime()}
              onPress={() => onChange(slot)}
            />
          ))}
        </ScrollView>
      ) : (
        <Text variant="caption" color="textSecondary">
          Pick a day to choose a time.
        </Text>
      )}
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  row: { gap: Spacing.sm, paddingVertical: Spacing.xs },
});
