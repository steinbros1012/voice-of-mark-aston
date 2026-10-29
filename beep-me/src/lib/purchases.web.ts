import { useMemo } from 'react';

// Web stub: subscriptions are bought in the iOS/Android app through RevenueCat.
export const PLUS_ENTITLEMENT = 'plus';
export const isPurchasesAvailable = false;

export async function configurePurchases(_userId: string | null): Promise<void> {}

export type PlusPackage = { id: string; title: string; priceString: string; period: string; raw: unknown };

export type PlusState = {
  available: boolean;
  isPlus: boolean;
  packages: PlusPackage[];
  loading: boolean;
  error: string | null;
  purchase: (pkg: PlusPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
};

export function usePlus(fallbackIsPlus: boolean): PlusState {
  return useMemo(
    () => ({
      available: false,
      isPlus: fallbackIsPlus,
      packages: [],
      loading: false,
      error: null,
      purchase: async () => false,
      restore: async () => false,
    }),
    [fallbackIsPlus],
  );
}
