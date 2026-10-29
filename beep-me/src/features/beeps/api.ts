import { supabase } from '@/lib/supabase';
import type { Beep, Profile, TablesInsert, TripType } from '@/types/database';

export type BeepDriver = Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'average_rating' | 'rating_count' | 'rides_given'>;
export type BeepWithDriver = Beep & { driver: BeepDriver };

const BEEP_WITH_DRIVER = '*, driver:profiles!beeps_driver_id_fkey(id, display_name, avatar_url, average_rating, rating_count, rides_given)';

export type TimeOfDay = 'any' | 'morning' | 'afternoon' | 'evening';
export type DateRange = 'any' | 'today' | 'tomorrow' | 'week' | 'weekend';

export type BeepFilters = {
  destination?: string;
  tripType?: TripType | 'any';
  /** Minimum seats still free. */
  seats?: number;
  date?: DateRange;
  timeOfDay?: TimeOfDay;
  /** Inclusive upper bound on price per seat, in cents. */
  maxPriceCents?: number | null;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** Resolve a date chip to an absolute [from, to) window. */
export function dateRangeWindow(range: DateRange, now = new Date()): { from: Date; to: Date | null } {
  const today = startOfDay(now);
  switch (range) {
    case 'today':
      return { from: now, to: addDays(today, 1) };
    case 'tomorrow':
      return { from: addDays(today, 1), to: addDays(today, 2) };
    case 'week':
      return { from: now, to: addDays(today, 7) };
    case 'weekend': {
      // Friday through Sunday of the current week (or next, if the weekend passed).
      const day = today.getDay(); // 0 Sun .. 6 Sat
      const daysUntilFriday = (5 - day + 7) % 7;
      const friday = addDays(today, day === 0 || day === 6 ? 0 : daysUntilFriday);
      const start = day === 0 ? addDays(today, -2) : day === 6 ? addDays(today, -1) : friday;
      return { from: start.getTime() > now.getTime() ? start : now, to: addDays(start, 3) };
    }
    case 'any':
    default:
      return { from: now, to: null };
  }
}

export function matchesTimeOfDay(iso: string, timeOfDay: TimeOfDay): boolean {
  if (timeOfDay === 'any') return true;
  const hour = new Date(iso).getHours();
  if (timeOfDay === 'morning') return hour < 12;
  if (timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
  return hour >= 17;
}

/** Upcoming open Beeps on a campus, soonest first, with optional filters. */
export async function listBeeps(universityId: string, filters: BeepFilters = {}): Promise<BeepWithDriver[]> {
  const { from, to } = dateRangeWindow(filters.date ?? 'any');
  let query = supabase
    .from('beeps')
    .select(BEEP_WITH_DRIVER)
    .eq('university_id', universityId)
    .eq('status', 'open')
    .gte('departure_at', from.toISOString())
    .order('departure_at', { ascending: true })
    .limit(100);

  if (to) query = query.lt('departure_at', to.toISOString());
  const destination = filters.destination?.trim();
  if (destination) query = query.ilike('destination', `%${destination}%`);
  if (filters.maxPriceCents != null) query = query.lte('price_per_seat_cents', filters.maxPriceCents);
  if (filters.tripType && filters.tripType !== 'any') query = query.eq('trip_type', filters.tripType);

  const { data, error } = await query;
  if (error) throw error;
  const timeOfDay = filters.timeOfDay ?? 'any';
  const seats = filters.seats ?? 1;
  // Time-of-day depends on the device time zone, so it is applied client-side.
  return data.filter((b) => matchesTimeOfDay(b.departure_at, timeOfDay) && seatsLeft(b) >= seats);
}

export async function getBeep(id: string): Promise<BeepWithDriver | null> {
  const { data, error } = await supabase.from('beeps').select(BEEP_WITH_DRIVER).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type NewBeep = Pick<
  TablesInsert<'beeps'>,
  'origin' | 'destination' | 'departure_at' | 'seats_total' | 'price_per_seat_cents' | 'note' | 'trip_type'
>;

export async function createBeep(driverId: string, universityId: string, input: NewBeep): Promise<Beep> {
  const { data, error } = await supabase
    .from('beeps')
    .insert({ ...input, driver_id: driverId, university_id: universityId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateBeep(id: string, input: NewBeep): Promise<Beep> {
  const { data, error } = await supabase.from('beeps').update(input).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function completeBeep(id: string): Promise<void> {
  const { error } = await supabase.from('beeps').update({ status: 'completed' }).eq('id', id);
  if (error) throw error;
}

export async function cancelBeep(id: string): Promise<void> {
  const { error } = await supabase.from('beeps').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

/** Beeps the signed-in student is driving (any status), newest departure first. */
export async function listMyBeeps(driverId: string): Promise<BeepWithDriver[]> {
  const { data, error } = await supabase
    .from('beeps')
    .select(BEEP_WITH_DRIVER)
    .eq('driver_id', driverId)
    .order('departure_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

export function seatsLeft(beep: Pick<Beep, 'seats_total' | 'seats_taken'>): number {
  return Math.max(0, beep.seats_total - beep.seats_taken);
}
