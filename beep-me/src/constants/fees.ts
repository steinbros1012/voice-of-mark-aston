/**
 * Marketplace economics. Amounts are integer cents everywhere to avoid float
 * drift; the same split is enforced server-side in Phase 5.
 */
export const PLATFORM_FEE_PERCENT = 15;

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
