import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';
const TTL_SECONDS = 60 * 60;
const cache = new Map<string, { url: string; expires: number }>();

/** Profiles store the storage path ("<user id>/avatar.jpg"), not a URL. */
export function isStoragePath(value: string): boolean {
  return !/^https?:\/\//.test(value);
}

/** Cached signed URL for a path, or null when missing or stale. Not a hook: safe to call from render. */
function cachedUrl(path: string): string | null {
  const hit = cache.get(path);
  return hit && hit.expires > Date.now() ? hit.url : null;
}

/** Signed URL for a private avatar path, cached for most of its lifetime. */
export async function signAvatar(path: string): Promise<string | null> {
  const hit = cache.get(path);
  if (hit && hit.expires > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SECONDS);
  if (error || !data) return null;
  cache.set(path, { url: data.signedUrl, expires: Date.now() + (TTL_SECONDS - 300) * 1000 });
  return data.signedUrl;
}

/** Resolves an avatar value (path or already-usable URL) to something an Image can load. */
export function useAvatarUrl(value: string | null | undefined): string | null {
  // State only holds asynchronously signed results; plain URLs and cache hits
  // are derived during render so nothing is set inside the effect itself.
  const [signed, setSigned] = useState<{ path: string; url: string } | null>(null);

  useEffect(() => {
    if (!value || !isStoragePath(value)) return;
    if (cachedUrl(value)) return;
    let active = true;
    void signAvatar(value).then((url) => {
      if (active && url) setSigned({ path: value, url });
    });
    return () => {
      active = false;
    };
  }, [value]);

  if (!value) return null;
  if (!isStoragePath(value)) return value;
  return cachedUrl(value) ?? (signed?.path === value ? signed.url : null);
}

/** Forget a cached URL after the photo changes. */
export function forgetAvatar(path: string): void {
  cache.delete(path);
}
