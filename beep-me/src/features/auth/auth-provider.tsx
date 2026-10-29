import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAnalytics } from '@/lib/analytics';
import { configurePurchases } from '@/lib/purchases';
import { Sentry } from '@/lib/sentry';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { OwnProfile, TablesUpdate } from '@/types/database';

import { TERMS_VERSION } from '@/features/legal/content';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type ProfileUpdate = Pick<TablesUpdate<'profiles'>, 'display_name' | 'bio' | 'avatar_url' | 'onboarding_completed_at'> &
  Pick<TablesUpdate<'profile_private'>, 'accepted_terms_version' | 'accepted_terms_at'>;

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: OwnProfile | null;
  /** True once the user has finished the onboarding screen. */
  isOnboarded: boolean;
  /** True when the profile has accepted the current Terms version. */
  hasAcceptedTerms: boolean;
  isConfigured: boolean;
  /**
   * Email a 6-digit code. With `createAccount` a new user is created on first
   * use (sign-up); without it an unknown email is rejected (log-in).
   */
  requestCode: (input: { email: string; createAccount: boolean }) => Promise<void>;
  verifyCode: (input: { email: string; code: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<OwnProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** How long the splash screen may wait on the first profile fetch. */
const BOOTSTRAP_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

export class AuthFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthFlowError';
  }
}

/** Turn Supabase errors into copy a student can act on. */
export function describeAuthError(error: unknown): string {
  if (error instanceof AuthFlowError) return error.message;
  const message = error instanceof Error ? error.message : String(error);
  if (/signups not allowed|otp_disabled|user not found/i.test(message)) {
    return 'No account uses that email yet. Sign up first.';
  }
  if (/token has expired|otp_expired/i.test(message)) return 'That code has expired. Request a new one.';
  if (/invalid.*otp|token.*invalid|invalid.*token/i.test(message)) {
    return 'That code is not right. Check the email and try again.';
  }
  if (/rate limit|too many requests|over_email_send_rate_limit|security purposes/i.test(message)) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (/only open at supported campuses|not allowed/i.test(message)) {
    return 'Use your university .edu email. Beep Me is only open at UNCW right now.';
  }
  if (/network request failed|failed to fetch|fetch/i.test(message)) {
    return 'No connection. Check your network and try again.';
  }
  if (/not enough seats/i.test(message)) return 'Not enough seats left on this ride.';
  if (/no longer taking requests|no longer open/i.test(message)) return 'This ride is no longer open.';
  if (/already left/i.test(message)) return 'This ride has already left.';
  if (/duplicate key|unique/i.test(message)) return 'You already have a request on this ride.';
  if (/row-level security|insufficient_privilege|permission denied/i.test(message)) {
    return "You don't have permission to do that.";
  }
  return message || 'Something went wrong. Try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const analytics = useAnalytics();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const userId = session?.user.id ?? null;
  const latestUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (id: string): Promise<OwnProfile | null> => {
    const [pub, priv] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('profile_private').select('*').eq('id', id).maybeSingle(),
    ]);
    if (pub.error || priv.error) {
      Sentry.captureException(pub.error ?? priv.error);
      return null;
    }
    if (!pub.data) return null;
    const { id: _id, updated_at: _updated, ...privateFields } = priv.data ?? {
      id,
      stripe_customer_id: null,
      has_payment_method: false,
      stripe_account_id: null,
      payouts_enabled: false,
      plus_expires_at: null,
      accepted_terms_version: null,
      accepted_terms_at: null,
      updated_at: '',
    };
    return { ...pub.data, ...privateFields };
  }, []);

  // Bootstrap from the persisted session, then follow auth changes.
  useEffect(() => {
    let cancelled = false;

    async function applySession(next: Session | null) {
      latestUserId.current = next?.user.id ?? null;
      // A hung network must not keep the splash screen up forever; a null
      // profile sends the user to onboarding, which reloads it on save.
      const nextProfile = next ? await withTimeout(loadProfile(next.user.id), BOOTSTRAP_TIMEOUT_MS, null) : null;
      // Ignore results from a session that has since changed.
      if (cancelled || latestUserId.current !== (next?.user.id ?? null)) return;
      setSession(next);
      setProfile(nextProfile);
      setStatus(next ? 'signedIn' : 'signedOut');
    }

    // onAuthStateChange emits INITIAL_SESSION with the persisted session on
    // subscribe, so one listener covers bootstrap and later changes.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'TOKEN_REFRESHED' && next?.user.id === latestUserId.current) {
        setSession(next);
        return;
      }
      void applySession(next);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Tie crash reports and analytics to the signed-in student (id only, no PII).
  useEffect(() => {
    void configurePurchases(userId);
    if (userId) {
      Sentry.setUser({ id: userId });
      analytics.identify(userId, { university_id: profile?.university_id ?? null });
    } else {
      Sentry.setUser(null);
      analytics.reset();
    }
  }, [userId, profile?.university_id, analytics]);

  const requestCode = useCallback<AuthContextValue['requestCode']>(async ({ email, createAccount }) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: createAccount },
    });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback<AuthContextValue['verifyCode']>(
    async ({ email, code }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: 'email',
      });
      if (error) throw error;
      if (!data.session) throw new AuthFlowError('Verification did not return a session. Try again.');
      const verified = await loadProfile(data.session.user.id);
      const universityId = verified?.university_id ?? null;
      if (verified && !verified.onboarding_completed_at) analytics.track('sign_up', { university_id: universityId });
      analytics.track('verification_completed', { university_id: universityId });
    },
    [analytics, loadProfile],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const next = await loadProfile(userId);
    if (next) setProfile(next);
  }, [userId, loadProfile]);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (changes) => {
      if (!userId) throw new AuthFlowError('You are signed out.');
      const { accepted_terms_version, accepted_terms_at, ...publicChanges } = changes;
      if (Object.keys(publicChanges).length) {
        const { error } = await supabase.from('profiles').update(publicChanges).eq('id', userId);
        if (error) throw error;
      }
      if (accepted_terms_version !== undefined || accepted_terms_at !== undefined) {
        const { error } = await supabase.from('profile_private').update({ accepted_terms_version, accepted_terms_at }).eq('id', userId);
        if (error) throw error;
      }
      const next = await loadProfile(userId);
      if (!next) throw new AuthFlowError('Profile could not be reloaded.');
      setProfile(next);
      return next;
    },
    [userId, loadProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      isOnboarded: Boolean(profile?.onboarding_completed_at),
      hasAcceptedTerms: profile?.accepted_terms_version === TERMS_VERSION,
      isConfigured: isSupabaseConfigured,
      requestCode,
      verifyCode,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [status, session, profile, requestCode, verifyCode, signOut, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
