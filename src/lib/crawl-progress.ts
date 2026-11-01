import type { CrawlListItem } from '../api/types';

const successfulStatuses = new Set(['completed', 'finished']);

export function isSuccessfulCrawl(status: string) {
  return successfulStatuses.has(status.toLowerCase());
}

export function crawlProgress(crawl: CrawlListItem) {
  if (isSuccessfulCrawl(crawl.status)) return 1;
  if (typeof crawl.progress !== 'number') return null;

  const estimate = Math.max(0, Math.min(1, crawl.progress));
  return crawl.status && estimate >= 1 ? 0.99 : estimate;
}

export function progressLabel(crawl: CrawlListItem) {
  if (isSuccessfulCrawl(crawl.status)) return 'Complete';
  if (typeof crawl.progress === 'number') return 'Estimated progress';
  return 'Progress unavailable';
}

export function processedPagesLabel(crawl: CrawlListItem) {
  if (typeof crawl.pages_processed !== 'number') return 'Waiting for page counts';
  const discovered = typeof crawl.pages_discovered === 'number'
    ? ` of ${crawl.pages_discovered} discovered`
    : '';
  return `${crawl.pages_processed} processed${discovered}`;
}
