import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Message } from '@/types/database';

export async function listMessages(seatRequestId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('seat_request_id', seatRequestId)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function sendMessage(seatRequestId: string, senderId: string, body: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ seat_request_id: seatRequestId, sender_id: senderId, body: body.trim() })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Live inserts for one conversation. Call the returned function to stop. */
export function subscribeToMessages(seatRequestId: string, onInsert: (message: Message) => void): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`messages:${seatRequestId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `seat_request_id=eq.${seatRequestId}` },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
