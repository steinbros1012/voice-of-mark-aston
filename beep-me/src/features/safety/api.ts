import { supabase } from '@/lib/supabase';
import type { ReportReason } from '@/types/database';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'no_show', label: 'No-show' },
  { value: 'unsafe_driving', label: 'Unsafe driving' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'scam', label: 'Scam or payment issue' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'other', label: 'Something else' },
];

export async function submitReport(input: { reporterId: string; userId?: string | null; beepId?: string | null; reason: ReportReason; details: string }) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: input.reporterId,
    reported_user_id: input.userId ?? null,
    reported_beep_id: input.beepId ?? null,
    reason: input.reason,
    details: input.details.trim() || null,
  });
  if (error) throw error;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error && !/duplicate key/i.test(error.message)) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', blockerId).eq('blocked_id', blockedId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
