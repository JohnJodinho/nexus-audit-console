import { describe, expect, it } from 'vitest';
import { crawlProgress, progressLabel } from './crawl-progress';

describe('crawl progress', () => {
  it('does not report completion for an active crawl estimate of 100%', () => {
    expect(crawlProgress({ id: '1', target_url: 'https://example.com', status: 'running', progress: 1 })).toBe(0.99);
  });

  it('reports completion only for successful terminal statuses', () => {
    expect(crawlProgress({ id: '1', target_url: 'https://example.com', status: 'completed' })).toBe(1);
    expect(progressLabel({ id: '1', target_url: 'https://example.com', status: 'running' })).toBe('Progress unavailable');
  });
});
