import { supabase } from '@/lib/supabase';
import type { Beep, Profile, SeatRequest } from '@/types/database';

import type { BeepDriver } from '@/features/beeps';

export type RequestRider = Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'average_rating' | 'rating_count' | 'rides_taken' | 'edu_verified'>;

/** A seat request with its ride (and the ride's driver) and the rider. */
export type SeatRequestDetail = SeatRequest & {
  beep: Beep & { driver: BeepDriver };
  rider: RequestRider;
};

const REQUEST_DETAIL =
  '*, beep:beeps!seat_requests_beep_id_fkey(*, driver:profiles!beeps_driver_id_fkey(id, display_name, avatar_url, average_rating, rating_count, rides_given)), rider:profiles!seat_requests_rider_id_fkey(id, display_name, avatar_url, average_rating, rating_count, rides_taken, edu_verified)';

export async function createSeatRequest(beepId: string, riderId: string, seats: number): Promise<SeatRequest> {
  const { data, error } = await supabase
    .from('seat_requests')
    .insert({ beep_id: beepId, rider_id: riderId, seats_requested: seats })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getSeatRequest(id: string): Promise<SeatRequestDetail | null> {
  const { data, error } = await supabase.from('seat_requests').select(REQUEST_DETAIL).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as SeatRequestDetail | null;
}

/** Everything the signed-in student has requested as a rider, newest departure first. */
export async function listMyRequests(riderId: string): Promise<SeatRequestDetail[]> {
  const { data, error } = await supabase
    .from('seat_requests')
    .select(REQUEST_DETAIL)
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as SeatRequestDetail[];
}

/** Requests on one of the driver's rides. */
export async function listRequestsForBeep(beepId: string): Promise<SeatRequestDetail[]> {
  const { data, error } = await supabase
    .from('seat_requests')
    .select(REQUEST_DETAIL)
    .eq('beep_id', beepId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as SeatRequestDetail[];
}

/** The rider's live request on a ride, if any (pending or accepted). */
export async function getMyRequestForBeep(beepId: string, riderId: string): Promise<SeatRequest | null> {
  const { data, error } = await supabase
    .from('seat_requests')
    .select('*')
    .eq('beep_id', beepId)
    .eq('rider_id', riderId)
    .in('status', ['pending', 'accepted'])
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setRequestStatus(id: string, status: 'accepted' | 'declined' | 'cancelled'): Promise<SeatRequest> {
  const { data, error } = await supabase.from('seat_requests').update({ status }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

/** Conversations: live requests the student is part of, latest message first. */
export async function listConversations(userId: string): Promise<SeatRequestDetail[]> {
  // RLS already limits rows to the rider or the driver; the filter keeps the
  // list to requests that can still be chatted on.
  const { data, error } = await supabase
    .from('seat_requests')
    .select(REQUEST_DETAIL)
    .in('status', ['pending', 'accepted'])
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as SeatRequestDetail[]).filter((r) => r.rider_id === userId || r.beep.driver_id === userId);
}

/** Pending request counts per beep for the driver's rides. */
export async function countPendingByBeep(beepIds: string[]): Promise<Record<string, number>> {
  if (beepIds.length === 0) return {};
  const { data, error } = await supabase
    .from('seat_requests')
    .select('beep_id')
    .in('beep_id', beepIds)
    .eq('status', 'pending');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data) counts[row.beep_id] = (counts[row.beep_id] ?? 0) + 1;
  return counts;
}

/** Copy for a request's status from the rider's point of view. */
export function describeRequestStatus(status: SeatRequest['status']): string {
  return {
    pending: 'Waiting for the driver to accept.',
    accepted: 'You are on this ride. Coordinate pickup in chat.',
    declined: 'The driver declined this request.',
    cancelled: 'This request was cancelled.',
  }[status];
}
