import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QueryState<T> = {
  data: T | null;
  error: string | null;
  /** First load with no data yet. */
  isLoading: boolean;
  /** Pull-to-refresh or background refetch while data is shown. */
  isRefreshing: boolean;
  refetch: () => Promise<void>;
};

type Options = {
  /** Refetch whenever the screen gains focus. Default true. */
  refetchOnFocus?: boolean;
  /** Skip fetching until true. */
  enabled?: boolean;
};

/**
 * Small fetch-state hook: load on mount, refetch on focus, expose refresh.
 * `fetcher` must be stable (wrap it in useCallback) or the query re-runs on
 * every render.
 */
export function useQuery<T>(fetcher: () => Promise<T>, options: Options = {}): QueryState<T> {
  const { refetchOnFocus = true, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestId = useRef(0);
  const hasData = useRef(false);
  const inFlight = useRef(false);

  const run = useCallback(async () => {
    if (!enabled) return;
    const id = ++requestId.current;
    inFlight.current = true;
    if (hasData.current) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const result = await fetcher();
      if (id !== requestId.current) return;
      hasData.current = true;
      setData(result);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      if (id === requestId.current) {
        inFlight.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    // Starting the fetch flips the loading flag on purpose; the rule guards
    // against render loops, which cannot happen here (run is memoised).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
  }, [run]);

  useFocusEffect(
    useCallback(() => {
      // A fetch already started by the effect above (new fetcher) must not be
      // duplicated; only a genuine return to the screen refetches.
      if (refetchOnFocus && hasData.current && !inFlight.current) void run();
    }, [refetchOnFocus, run]),
  );

  return { data, error, isLoading, isRefreshing, refetch: run };
}
