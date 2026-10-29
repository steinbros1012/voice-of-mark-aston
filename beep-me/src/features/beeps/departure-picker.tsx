import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatDepartureDay, formatTime } from '@/lib/format';

const DAYS_AHEAD = 14;
const SLOT_MINUTES = 30;

type DeparturePickerProps = { value: Date | null; onChange: (next: Date) => void; error?: string | null };

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
 * chips, then half-hour slots for the chosen day. Identical on iOS, Android and web.
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
  const timeScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const dayScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const slotOffsets = useRef<Record<string, number>>({});
  const dayOffsets = useRef<Record<string, number>>({});
  const selectedKey = value?.toISOString() ?? null;
  const selectedDayKey = selectedDay?.toISOString() ?? null;

  // Bring the chosen chips into view (matters when editing an existing ride).
  useEffect(() => {
    const x = selectedKey ? slotOffsets.current[selectedKey] : undefined;
    if (x != null) timeScroll.current?.scrollTo({ x: Math.max(0, x - 16), animated: false });
  }, [selectedKey]);
  useEffect(() => {
    const x = selectedDayKey ? dayOffsets.current[selectedDayKey] : undefined;
    if (x != null) dayScroll.current?.scrollTo({ x: Math.max(0, x - 16), animated: false });
  }, [selectedDayKey]);

  const slots = useMemo(() => {
    if (!selectedDay) return [];
    const list: Date[] = [];
    for (let minutes = 5 * 60; minutes < 24 * 60; minutes += SLOT_MINUTES) {
      const slot = new Date(selectedDay);
      slot.setMinutes(minutes);
      if (slot.getTime() > now.getTime() + 15 * 60 * 1000) list.push(slot);
    }
    return list;
  }, [selectedDay, now]);

  function pickDay(day: Date) {
    const next = new Date(day);
    if (value) next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    else next.setHours(17, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      const first = slots[0];
      next.setHours(first ? first.getHours() : 23, first ? first.getMinutes() : 30, 0, 0);
    }
    onChange(next);
  }

  return (
    <View style={styles.wrapper}>
      <Text variant="label">Departure day</Text>
      <ScrollView ref={dayScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {days.map((day) => (
          <View key={day.toISOString()} onLayout={(e) => (dayOffsets.current[day.toISOString()] = e.nativeEvent.layout.x)}>
            <Chip label={formatDepartureDay(day, now)} selected={selectedDay ? sameDay(day, selectedDay) : false} onPress={() => pickDay(day)} />
          </View>
        ))}
      </ScrollView>
      <Text variant="label">Departure time</Text>
      {selectedDay ? (
        <ScrollView ref={timeScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {slots.map((slot) => (
            <View
              key={slot.toISOString()}
              onLayout={(e) => {
                slotOffsets.current[slot.toISOString()] = e.nativeEvent.layout.x;
                if (slot.toISOString() === selectedKey) timeScroll.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 16), animated: false });
              }}>
              <Chip label={formatTime(slot)} selected={value?.getTime() === slot.getTime()} onPress={() => onChange(slot)} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text variant="caption" color="textSecondary">
          Pick a day first.
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
  row: { gap: Spacing.sm, paddingVertical: 2 },
});
