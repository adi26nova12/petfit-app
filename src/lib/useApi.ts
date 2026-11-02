import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal fetch-on-mount hook for screens. Re-runs when `deps` change.
 * Swap for TanStack Query if the backend team prefers caching / background
 * refetch — call sites keep the same `{ data, loading, error, reload }` shape.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const key = JSON.stringify(deps);
  const [tick, setTick] = useState(0);
  const id = `${key}#${tick}`;
  const [result, setResult] = useState<{ id: string; data: T | null; error: Error | null } | null>(null);

  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let live = true;
    fnRef.current().then(
      (data) => live && setResult({ id, data, error: null }),
      (error: Error) => live && setResult({ id, data: null, error }),
    );
    return () => {
      live = false;
    };
  }, [id]);

  const current = result?.id === id ? result : null;
  const setData = useCallback((data: T) => setResult({ id, data, error: null }), [id]);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data: current?.data ?? null, loading: !current, error: current?.error ?? null, reload, setData };
}
