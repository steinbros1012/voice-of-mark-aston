import { Share } from 'react-native';

import { formatCents } from '@/constants/fees';
import { env } from '@/lib/env';
import { formatDeparture } from '@/lib/format';
import type { Beep } from '@/types/database';

/** Public link for a Beep: the web origin when configured, else the app scheme. */
export function beepLink(beepId: string): string {
  const base = env.appUrl?.replace(/\/$/, '');
  return base ? `${base}/beep/${beepId}` : `beepme://beep/${beepId}`;
}

/** Open the native share sheet (Snapchat, Messages, group chats) with a link back into the app. */
export async function shareBeep(beep: Pick<Beep, 'id' | 'origin' | 'destination' | 'departure_at' | 'price_per_seat_cents'>) {
  const url = beepLink(beep.id);
  const message = `Beep Me: ${beep.origin} → ${beep.destination}, ${formatDeparture(beep.departure_at)}, ${formatCents(beep.price_per_seat_cents)} a seat. Grab a seat: ${url}`;
  await Share.share({ message, url, title: 'Share this Beep' });
}
