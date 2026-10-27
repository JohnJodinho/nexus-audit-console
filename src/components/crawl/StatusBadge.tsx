import { Pause, Play } from 'lucide-react';
import type { CrawlStatus } from '../../api/types';
import { labelForStatus } from '../../data/crawl-status';

export function StatusBadge({ status }: { status: CrawlStatus }) {
  const normalized = status.toLowerCase();
  const icon = ['running', 'queued'].includes(normalized)
    ? <Play size={11} fill="currentColor" />
    : normalized === 'paused'
      ? <Pause size={11} fill="currentColor" />
      : <span className="status-check">✓</span>;
  return <span className={`status-badge status-${normalized}`}>{icon}{labelForStatus(status)}</span>;
}
