import { supabase } from '@/lib/supabase';
import type { Payment } from '@/types/database';

/** Call an Edge Function and surface its JSON error message. */
export async function callFunction<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    // supabase-js wraps non-2xx responses; read the JSON body for the real message.
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      const payload = (await context.json().catch(() => null)) as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
    }
    throw new Error(error.message);
  }
  if (data == null) throw new Error('Empty response');
  return data;
}

export type SetupParams = { customerId: string; customerEphemeralKeySecret: string; setupIntentClientSecret: string };

export const paymentsApi = {
  setup: () => callFunction<SetupParams>('payments', { action: 'setup' }),
  sync: () => callFunction<{ hasPaymentMethod: boolean }>('payments', { action: 'sync' }),
  connectStatus: () => callFunction<{ payoutsEnabled: boolean; detailsSubmitted: boolean }>('connect', { action: 'status' }),
  connectOnboard: () => callFunction<{ url: string }>('connect', { action: 'onboard' }),
  acceptRequest: (requestId: string) => callFunction<{ ok: true; amountCents: number }>('accept-request', { requestId }),
  declineRequest: (requestId: string) => callFunction<{ ok: true }>('cancel-request', { requestId, action: 'decline' }),
  cancelRequest: (requestId: string) => callFunction<{ ok: true; refunded: boolean }>('cancel-request', { requestId, action: 'cancel' }),
  cancelBeep: (beepId: string) => callFunction<{ ok: true; refunded: number }>('cancel-beep', { beepId }),
  completeBeep: (beepId: string) => callFunction<{ ok: true; paidOutCents: number }>('complete-beep', { beepId }),
};

export async function getPaymentForRequest(seatRequestId: string): Promise<Payment | null> {
  const { data, error } = await supabase.from('payments').select('*').eq('seat_request_id', seatRequestId).maybeSingle();
  if (error) throw error;
  return data;
}

export type EarningRow = Payment & {
  seat_request: { beep: { id: string; origin: string; destination: string; departure_at: string }; rider: { display_name: string } };
};

export async function listEarnings(driverId: string): Promise<EarningRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, seat_request:seat_requests!payments_seat_request_id_fkey(beep:beeps!seat_requests_beep_id_fkey(id, origin, destination, departure_at), rider:profiles!seat_requests_rider_id_fkey(display_name))')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as unknown as EarningRow[];
}

export function describePaymentStatus(status: Payment['status']): string {
  return {
    pending: 'Processing',
    succeeded: 'Paid, held until the ride completes',
    failed: 'Payment failed',
    refunded: 'Refunded',
    paid_out: 'Paid out to the driver',
  }[status];
}
