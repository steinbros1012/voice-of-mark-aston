import * as ImagePicker from 'expo-image-picker';

import { forgetAvatar } from '@/lib/avatars';
import { supabase } from '@/lib/supabase';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class AvatarError extends Error {}

/**
 * Let the student pick a square photo and upload it to the avatars bucket
 * under their own folder (enforced by storage RLS). The bucket is private;
 * the returned value is the storage path, which the Avatar component turns
 * into a short-lived signed URL. Type and size are checked here and again by
 * the bucket's own limits.
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

  const contentType = asset.mimeType ?? 'image/jpeg';
  if (!ALLOWED.has(contentType)) throw new AvatarError('Choose a JPEG, PNG or WebP image.');
  const bytes = await fetch(asset.uri).then((res) => res.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) throw new AvatarError('That photo is over 2 MB. Pick a smaller one.');
  const path = `${userId}/avatar.jpg`;

  const { error } = await supabase.storage.from('avatars').upload(path, bytes, { contentType, upsert: true });
  if (error) throw new AvatarError(error.message);
  forgetAvatar(path);
  return path;
}
