import { describe, expect, it } from 'vitest';
import { crawlSectionPath, getCrawlRouteContext } from './routes';

describe('crawl routes', () => {
  it('preserves encoded crawl IDs and sections', () => {
    expect(crawlSectionPath('crawl/one', 'exports')).toBe('/crawls/crawl%2Fone/exports');
    expect(getCrawlRouteContext('/crawls/crawl%2Fone/exports')).toEqual({ crawlId: 'crawl/one', section: 'exports' });
  });

  it('does not treat unrelated paths as crawl sections', () => {
    expect(getCrawlRouteContext('/crawls/new')).toBeNull();
    expect(getCrawlRouteContext('/crawls/abc/unknown')).toBeNull();
  });
});
