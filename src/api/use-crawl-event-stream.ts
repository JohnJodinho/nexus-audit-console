import { useEffect, useRef } from 'react';
import { startEventStream } from './sse';
import type { ApiEvent } from './types';
import type { StreamState } from './sse';

type UseCrawlEventStreamOptions = {
  token: string | null;
  crawlId: string | undefined;
  onEvent?: (event: ApiEvent) => void;
  onStateChange?: (state: StreamState) => void;
  onUnauthorized?: () => void;
};

/**
 * Hook that subscribes to the authenticated SSE event stream for a specific crawl.
 * Automatically starts the stream on mount, tears it down on unmount or when
 * the crawlId/token changes, and keeps callback references stable via refs so
 * the effect does not re-run on every render.
 */
export function useCrawlEventStream({
  token,
  crawlId,
  onEvent,
  onStateChange,
  onUnauthorized,
}: UseCrawlEventStreamOptions) {
  const callbacksRef = useRef({ onEvent, onStateChange, onUnauthorized });
  callbacksRef.current = { onEvent, onStateChange, onUnauthorized };

  useEffect(() => {
    if (!token || !crawlId) return undefined;

    const stop = startEventStream(token, {
      onEvent: (event: ApiEvent) => {
        callbacksRef.current.onEvent?.(event);
      },
      onStateChange: (state: StreamState) => {
        callbacksRef.current.onStateChange?.(state);
      },
      onUnauthorized: () => {
        callbacksRef.current.onUnauthorized?.();
      },
    }, crawlId);

    return stop;
  }, [token, crawlId]);
}
