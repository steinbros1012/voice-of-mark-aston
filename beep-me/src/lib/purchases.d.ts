// Type entry for '@/lib/purchases'. Metro resolves purchases.native.ts on iOS
// and Android and purchases.web.ts on web; both implement this API.
export const PLUS_ENTITLEMENT: string;
export const isPurchasesAvailable: boolean;
export function configurePurchases(userId: string | null): Promise<void>;

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

export function usePlus(fallbackIsPlus: boolean): PlusState;
