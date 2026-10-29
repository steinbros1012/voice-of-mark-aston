import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export class AvatarError extends Error {}

/**
 * Let the student pick a square photo and upload it to the avatars bucket
 * under their own folder (enforced by storage RLS). Returns the public URL
 * with a cache-busting query so the new image shows immediately.
 */
export async function pickAndUploadAvatar(userId: string): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new AvatarError('Allow photo access in Settings to add a profile photo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return null;

  const bytes = await fetch(asset.uri).then((res) => res.arrayBuffer());
  const contentType = asset.mimeType ?? 'image/jpeg';
  const path = `${userId}/avatar.jpg`;

  const { error } = await supabase.storage.from('avatars').upload(path, bytes, { contentType, upsert: true });
  if (error) throw new AvatarError(error.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
