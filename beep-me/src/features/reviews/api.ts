import { supabase } from '@/lib/supabase';
import type { Profile, Review } from '@/types/database';

export type ReviewWithReviewer = Review & { reviewer: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> };

export async function getPublicProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listReviewsFor(userId: string): Promise<ReviewWithReviewer[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, display_name, avatar_url)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as ReviewWithReviewer[];
}

export async function submitReview(input: { beepId: string; reviewerId: string; revieweeId: string; stars: number; text: string }): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    beep_id: input.beepId,
    reviewer_id: input.reviewerId,
    reviewee_id: input.revieweeId,
    stars: input.stars,
    text: input.text.trim() || null,
  });
  if (error) throw error;
}

/** The review the signed-in student already left on a ride for someone, if any. */
export async function getMyReview(beepId: string, reviewerId: string, revieweeId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('beep_id', beepId)
    .eq('reviewer_id', reviewerId)
    .eq('reviewee_id', revieweeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
