/**
 * Marketplace economics. Amounts are integer cents everywhere to avoid float
 * drift; the same split is enforced server-side in Phase 5.
 */
export const PLATFORM_FEE_PERCENT = 15;
/** Rider-side booking fee per booking, waived for Beep Me Plus riders. */
export const RIDER_BOOKING_FEE_CENTS = 100;

export type FeeBreakdown = {
  /** What the rider is charged. */
  totalCents: number;
  /** Beep Me's cut (before payment processing costs). */
  platformFeeCents: number;
  /** What the driver receives. */
  driverPayoutCents: number;
};

/** Example: 2000 → { total 2000, fee 300, driver 1700 }. */
export function splitFare(totalCents: number): FeeBreakdown {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error(`splitFare expects a non-negative integer of cents, got ${totalCents}`);
  }
  const platformFeeCents = Math.round((totalCents * PLATFORM_FEE_PERCENT) / 100);
  return {
    totalCents,
    platformFeeCents,
    driverPayoutCents: totalCents - platformFeeCents,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export type BookingQuote = {
  seatSubtotalCents: number;
  bookingFeeCents: number;
  /** What the rider is charged. */
  amountCents: number;
  /** Beep Me's share: 15% of the seats plus the booking fee. */
  platformFeeCents: number;
  /** What the driver receives on completion. */
  driverPayoutCents: number;
};

/** Same math as supabase/functions/_shared/fees.ts; the server is authoritative. */
export function quoteBooking(seats: number, pricePerSeatCents: number, riderIsPlus: boolean): BookingQuote {
  const seatSubtotalCents = seats * pricePerSeatCents;
  const bookingFeeCents = seatSubtotalCents > 0 && !riderIsPlus ? RIDER_BOOKING_FEE_CENTS : 0;
  const amountCents = seatSubtotalCents + bookingFeeCents;
  const driverPayoutCents = splitFare(seatSubtotalCents).driverPayoutCents;
  return { seatSubtotalCents, bookingFeeCents, amountCents, platformFeeCents: amountCents - driverPayoutCents, driverPayoutCents };
}
