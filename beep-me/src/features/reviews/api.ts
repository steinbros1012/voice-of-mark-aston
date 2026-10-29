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
