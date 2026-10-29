import type { AuthError, Session, User } from '@supabase/supabase-js';
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
import { Sentry } from '@/lib/sentry';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Profile, TablesUpdate } from '@/types/database';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type SignUpResult =
  | { kind: 'needsVerification'; email: string }
  | { kind: 'signedIn' }
  | { kind: 'alreadyRegistered' };

export type SignInResult = { kind: 'signedIn' } | { kind: 'needsVerification'; email: string };

type ProfileUpdate = Pick<TablesUpdate<'profiles'>, 'display_name' | 'bio' | 'avatar_url' | 'onboarding_completed_at'>;

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** True once the user has finished the onboarding screen. */
  isOnboarded: boolean;
  isConfigured: boolean;
  signUp: (input: { email: string; password: string; displayName: string }) => Promise<SignUpResult>;
  signIn: (input: { email: string; password: string }) => Promise<SignInResult>;
  verifySignUpCode: (input: { email: string; code: string }) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<Profile>;
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

/** Supabase reports an unconfirmed email as a sign-in error; map it to a state. */
function isEmailNotConfirmed(error: AuthError): boolean {
  return error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message);
}

export class AuthFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthFlowError';
  }
}

/** Turn Supabase auth errors into copy a student can act on. */
export function describeAuthError(error: unknown): string {
  if (error instanceof AuthFlowError) return error.message;
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/token has expired|otp_expired/i.test(message)) return 'That code has expired. Request a new one.';
  if (/invalid.*otp|token.*invalid/i.test(message)) return 'That code is not right. Check the email and try again.';
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(message)) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (/network request failed|fetch/i.test(message)) return 'No connection. Check your network and try again.';
  return message || 'Something went wrong. Try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const analytics = useAnalytics();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const userId = session?.user.id ?? null;
  const latestUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (id: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) {
      Sentry.captureException(error);
      return null;
    }
    return data;
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
    if (userId) {
      Sentry.setUser({ id: userId });
      analytics.identify(userId, { university_id: profile?.university_id ?? null });
    } else {
      Sentry.setUser(null);
      analytics.reset();
    }
  }, [userId, profile?.university_id, analytics]);

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ email, password, displayName }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) throw error;
      // With email confirmation on, Supabase returns a user with no identities
      // when the address is already registered (to avoid leaking accounts).
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { kind: 'alreadyRegistered' };
      }
      analytics.track('sign_up', { university_id: null });
      if (data.session) return { kind: 'signedIn' };
      return { kind: 'needsVerification', email: normalizedEmail };
    },
    [analytics],
  );

  const signIn = useCallback<AuthContextValue['signIn']>(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      if (isEmailNotConfirmed(error)) return { kind: 'needsVerification', email: normalizedEmail };
      throw error;
    }
    return { kind: 'signedIn' };
  }, []);

  const verifySignUpCode = useCallback<AuthContextValue['verifySignUpCode']>(
    async ({ email, code }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: 'signup',
      });
      if (error) throw error;
      if (!data.session) throw new AuthFlowError('Verification did not return a session. Try logging in.');
      const verified = await loadProfile(data.session.user.id);
      analytics.track('verification_completed', { university_id: verified?.university_id ?? null });
    },
    [analytics, loadProfile],
  );

  const resendSignUpCode = useCallback<AuthContextValue['resendSignUpCode']>(async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
    if (error) throw error;
  }, []);

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
      const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId).select('*').single();
      if (error) throw error;
      setProfile(data);
      return data;
    },
    [userId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      isOnboarded: Boolean(profile?.onboarding_completed_at),
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      verifySignUpCode,
      resendSignUpCode,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [status, session, profile, signUp, signIn, verifySignUpCode, resendSignUpCode, signOut, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
