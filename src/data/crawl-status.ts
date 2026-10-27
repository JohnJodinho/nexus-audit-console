import type { CrawlStatus } from '../api/types';

export const statusLabels: Record<string, string> = {
  queued: 'Queued',
  running: 'Running',
  paused: 'Paused',
  draining: 'Draining',
  consolidating: 'Consolidating',
  finished: 'Finished',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function labelForStatus(status: CrawlStatus) {
  return statusLabels[status.toLowerCase()] ?? status;
}

export function isActiveStatus(status: CrawlStatus) {
  return ['queued', 'running', 'paused'].includes(status.toLowerCase());
}
