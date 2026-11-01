import { describe, expect, it } from 'vitest';
import { parseSseFrame } from './sse';

describe('SSE parsing', () => {
  it('parses IDs, event names, and JSON data', () => {
    expect(parseSseFrame('id: 42\nevent: page.available\ndata: {"page_id":1}')).toEqual({
      id: '42',
      event: 'page.available',
      data: { page_id: 1 },
    });
  });

  it('rejects malformed JSON without producing an event', () => {
    expect(parseSseFrame('event: message\ndata: {invalid')).toBeUndefined();
  });
});
