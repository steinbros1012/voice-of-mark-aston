// Mirrors src/constants/fees.ts. Amounts are integer cents.
export const PLATFORM_FEE_PERCENT = 15;
export const RIDER_BOOKING_FEE_CENTS = 100;

export type BookingQuote = {
  seatSubtotalCents: number;
  bookingFeeCents: number;
  amountCents: number;
  platformFeeCents: number;
  driverPayoutCents: number;
};

/** Rider pays seats × price plus a booking fee (waived for Plus). Driver gets the subtotal less 15%. */
export function quoteBooking(seats: number, pricePerSeatCents: number, riderIsPlus: boolean): BookingQuote {
  const seatSubtotalCents = seats * pricePerSeatCents;
  const bookingFeeCents = seatSubtotalCents > 0 && !riderIsPlus ? RIDER_BOOKING_FEE_CENTS : 0;
  const amountCents = seatSubtotalCents + bookingFeeCents;
  const driverPayoutCents = seatSubtotalCents - Math.round((seatSubtotalCents * PLATFORM_FEE_PERCENT) / 100);
  return {
    seatSubtotalCents,
    bookingFeeCents,
    amountCents,
    platformFeeCents: amountCents - driverPayoutCents,
    driverPayoutCents,
  };
}
