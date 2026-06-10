import { useEffect, useRef } from "react";

/** Change this one value to adjust polling frequency across the entire app. */
export const POLL_INTERVAL_MS = 3000;

/** Slower tier for data that changes infrequently (reports, users, stats). */
export const POLL_INTERVAL_SLOW_MS = 120_000;

/** Pass to useSafePolling to disable background polling (fetch once on mount only). */
export const POLL_INTERVAL_NEVER = 0;

export function useSafePolling(refetch, isFetching, intervalMs = POLL_INTERVAL_MS) {
  const isFetchingRef = useRef(isFetching);

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => {
      if (!isFetchingRef.current) refetch();
    }, intervalMs);
    return () => clearInterval(id);
  }, [refetch, intervalMs]);
}
