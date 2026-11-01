import { useCallback, useEffect, useRef } from 'react';

export function useRefreshScheduler(refresh: () => Promise<void>, delayMs = 500) {
  const refreshRef = useRef(refresh);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const pendingRef = useRef(false);
  refreshRef.current = refresh;

  const run = useCallback(() => {
    if (inFlightRef.current) {
      pendingRef.current = true;
      return inFlightRef.current;
    }
    const request = refreshRef.current().finally(() => {
      inFlightRef.current = null;
      if (pendingRef.current) {
        pendingRef.current = false;
        void run();
      }
    });
    inFlightRef.current = request;
    return request;
  }, []);

  const schedule = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void run();
    }, delayMs);
  }, [delayMs, run]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  return { refresh: run, schedule };
}
