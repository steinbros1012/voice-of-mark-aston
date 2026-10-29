import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import PurchasesSdk from 'react-native-purchases';

import { env } from '@/lib/env';

// iOS/Android implementation. See purchases.web.ts for the stub.
const RC = { default: PurchasesSdk };

export const PLUS_ENTITLEMENT = 'plus';
const apiKey = Platform.OS === 'ios' ? env.revenueCatIosKey : Platform.OS === 'android' ? env.revenueCatAndroidKey : undefined;
export const isPurchasesAvailable = Boolean(RC && apiKey);

let configured = false;

/** Configure once at startup; log the student in so entitlements follow their account. */
export async function configurePurchases(userId: string | null): Promise<void> {
  if (!RC || !apiKey) return;
  const Purchases = RC.default;
  if (!configured) {
    Purchases.configure({ apiKey, appUserID: userId ?? undefined });
    configured = true;
  } else if (userId) {
    await Purchases.logIn(userId);
  } else {
    await Purchases.logOut().catch(() => undefined);
  }
}

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

/** Offerings and entitlement for the paywall. `fallbackIsPlus` comes from the profile (server truth). */
export function usePlus(fallbackIsPlus: boolean): PlusState {
  const [entitled, setIsPlus] = useState(false);
  const isPlus = entitled || fallbackIsPlus;
  const [packages, setPackages] = useState<PlusPackage[]>([]);
  const [loading, setLoading] = useState(isPurchasesAvailable);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!RC || !apiKey) return;
    const Purchases = RC.default;
    let active = true;
    (async () => {
      try {
        const [offerings, info] = await Promise.all([Purchases.getOfferings(), Purchases.getCustomerInfo()]);
        if (!active) return;
        const current = offerings.current;
        setPackages(
          (current?.availablePackages ?? []).map((p) => ({
            id: p.identifier,
            title: p.product.title,
            priceString: p.product.priceString,
            period: p.packageType,
            raw: p,
          })),
        );
        setIsPlus(Boolean(info.entitlements.active[PLUS_ENTITLEMENT]));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load plans.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    const listener = (info: { entitlements: { active: Record<string, unknown> } }) => {
      setIsPlus(Boolean(info.entitlements.active[PLUS_ENTITLEMENT]));
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      active = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const purchase = useCallback(async (pkg: PlusPackage) => {
    if (!RC) return false;
    try {
      const result = await RC.default.purchasePackage(pkg.raw as never);
      const active = Boolean(result.customerInfo.entitlements.active[PLUS_ENTITLEMENT]);
      setIsPlus(active);
      return active;
    } catch (err) {
      const e = err as { userCancelled?: boolean; message?: string };
      if (!e.userCancelled) setError(e.message ?? 'Purchase failed.');
      return false;
    }
  }, []);

  const restore = useCallback(async () => {
    if (!RC) return false;
    try {
      const info = await RC.default.restorePurchases();
      const active = Boolean(info.entitlements.active[PLUS_ENTITLEMENT]);
      setIsPlus(active);
      return active;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed.');
      return false;
    }
  }, []);

  return { available: isPurchasesAvailable, isPlus, packages, loading, error, purchase, restore };
}
