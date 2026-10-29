// Push notifications through Expo's push service. Tokens come from the
// push_tokens table; invalid tokens are pruned on the next response.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

type PushMessage = { title: string; body: string; data?: Record<string, string> };

export async function pushToUsers(admin: SupabaseClient, userIds: string[], message: PushMessage): Promise<number> {
  if (userIds.length === 0) return 0;
  const { data: tokens } = await admin.from('push_tokens').select('token').in('user_id', userIds);
  if (!tokens?.length) return 0;
  const messages = tokens.map((t) => ({ to: t.token, sound: 'default', title: message.title, body: message.body, data: message.data ?? {} }));
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Encoding': 'gzip, deflate' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    console.error('Expo push error', res.status);
    return 0;
  }
  const result = (await res.json().catch(() => ({ data: [] }))) as { data?: { status: string; details?: { error?: string } }[] };
  const dead = (result.data ?? [])
    .map((r, i) => (r.status === 'error' && r.details?.error === 'DeviceNotRegistered' ? messages[i]?.to : null))
    .filter((t): t is string => Boolean(t));
  if (dead.length) await admin.from('push_tokens').delete().in('token', dead);
  return messages.length - dead.length;
}
