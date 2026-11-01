import { useEffect, useRef } from 'react';
import { startPreviewEventStream, type StreamState } from './sse';
import type { ApiEvent } from './types';

export function useExportPreviewStream(options: { token: string | null; crawlId: string; previewId: string | null; onEvent: (event: ApiEvent) => void; onStateChange: (state: StreamState) => void; onUnauthorized: () => void; onError?: (message: string) => void }) {
  const callbacks = useRef(options);
  callbacks.current = options;
  useEffect(() => {
    if (!options.token || !options.previewId) return undefined;
    const stop = startPreviewEventStream(options.token, options.crawlId, options.previewId, {
      onEvent: (event) => {
        callbacks.current.onEvent(event);
        if (['preview.completed', 'preview.failed', 'preview.cancelled'].includes(event.event)) stop();
      },
      onStateChange: (state) => callbacks.current.onStateChange(state),
      onUnauthorized: () => callbacks.current.onUnauthorized(),
      onError: (message) => callbacks.current.onError?.(message),
    });
    return stop;
  }, [options.crawlId, options.previewId, options.token]);
}
