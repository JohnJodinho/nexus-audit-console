import type { ApiEvent } from './types';
import { appConfig } from '../config';

type StreamState = 'connected' | 'reconnecting' | 'disconnected';

type StreamCallbacks = {
  onEvent: (event: ApiEvent) => void;
  onStateChange: (state: StreamState) => void;
  onUnauthorized: () => void;
};

export function parseSseFrame(frame: string): ApiEvent | undefined {
  let id: string | undefined;
  let event = 'message';
  const dataLines: string[] = [];
  frame.split(/\r?\n/).forEach((line) => {
    if (line.startsWith(':')) return;
    if (line.startsWith('id:')) id = line.slice(3).trim();
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
  });
  if (dataLines.length === 0) return undefined;
  try {
    return { id, event, data: JSON.parse(dataLines.join('\n')) };
  } catch {
    return undefined;
  }
}

export function startEventStream(token: string, callbacks: StreamCallbacks, crawlId?: string) {
  const controller = new AbortController();
  let lastEventId: string | undefined;
  let stopped = false;
  let retryDelay = 1000;

  const connect = async () => {
    if (stopped) return;
    callbacks.onStateChange(lastEventId ? 'reconnecting' : 'connected');
    const query = crawlId ? `?crawl_id=${encodeURIComponent(crawlId)}` : '';
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/events${query}`, {
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
          ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}),
        },
        signal: controller.signal,
      });
      if (response.status === 401) {
        callbacks.onUnauthorized();
        return;
      }
      if (!response.ok || !response.body) throw new Error('Event stream unavailable');
      callbacks.onStateChange('connected');
      retryDelay = 1000;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (!stopped) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() ?? '';
        frames.forEach((frame) => {
          const parsed = parseSseFrame(frame);
          if (!parsed) return;
          if (parsed.id) lastEventId = parsed.id;
          if (parsed.event === 'resync_required') {
            lastEventId = undefined;
            callbacks.onEvent(parsed);
            return;
          }
          callbacks.onEvent(parsed);
        });
      }
      if (!stopped) throw new Error('Event stream ended');
    } catch {
      if (stopped) return;
      callbacks.onStateChange('reconnecting');
      window.setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  };

  void connect();
  return () => {
    stopped = true;
    callbacks.onStateChange('disconnected');
    controller.abort();
  };
}
