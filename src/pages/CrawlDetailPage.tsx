import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { exportCrawl, request } from '../api/client';
import { useCrawlEventStream } from '../api/use-crawl-event-stream';
import type { CrawlListItem } from '../api/types';
import { useAuth } from '../auth';
import { ActionButton, type CrawlAction } from '../components/crawl/ActionButton';
import { ProgressBar } from '../components/crawl/ProgressBar';
import { StatusBadge } from '../components/crawl/StatusBadge';
import { ErrorState, LoadingState } from '../components/feedback/States';
import { labelForStatus, isActiveStatus } from '../data/crawl-status';

export function CrawlDetailPage() {
  const { crawlId } = useParams();
  const { token, signOut } = useAuth();
  const [crawl, setCrawl] = useState<CrawlListItem | null>(null);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [streamState, setStreamState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !crawlId) return;
    try { setCrawl(await request<CrawlListItem>(`/api/crawls/${encodeURIComponent(crawlId)}`, {}, token, signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load crawl.'); }
  }, [token, crawlId, signOut]);
  useEffect(() => { void load(); }, [load]);

  // SSE: live updates for this specific crawl
  useCrawlEventStream({
    token,
    crawlId,
    onEvent: (event) => {
      const data = event.data as Record<string, unknown> | undefined;
      if (!data) return;

      if (event.event === 'resync_required') {
        void load();
        return;
      }
      if (event.event === 'action.outcome') {
        void load();
        return;
      }
      if (event.event === 'crawl.deleted') {
        window.location.assign('/crawls');
        return;
      }

      // Optimistic updates from enriched event payloads
      setCrawl(prev => {
        if (!prev) return prev;
        const next: CrawlListItem = { ...prev };

        if (event.event === 'crawl.progress' || event.event === 'crawl.stats_updated') {
          if (typeof data.pages_processed === 'number') next.pages_processed = data.pages_processed;
          if (typeof data.pages_discovered === 'number') next.pages_processed = (prev.pages_processed ?? 0) + data.pages_discovered;
          if (typeof data.pages_failed === 'number') next.pages_failed = data.pages_failed;
          if (typeof data.findings_count === 'number') next.findings_count = data.findings_count;
          if (typeof data.status === 'string') next.status = data.status as CrawlListItem['status'];
          if (typeof data.latest_url === 'string') setLiveUrl(data.latest_url);
        }
        if (event.event === 'page.available') {
          next.pages_processed = (prev.pages_processed ?? 0) + 1;
          if (typeof data.latest_url === 'string') setLiveUrl(data.latest_url);
          if (typeof data.findings_count === 'number') next.findings_count = data.findings_count;
        }
        if (event.event === 'crawl.status_changed' && typeof data.status === 'string') {
          next.status = data.status as CrawlListItem['status'];
        }

        return next;
      });
    },
    onStateChange: setStreamState,
    onUnauthorized: signOut,
  });
  async function runAction(name: CrawlAction) {
    if (!token || !crawlId) return;
    setAction(name); setError('');
    try { await request(`/api/crawls/${encodeURIComponent(crawlId)}/${name}`, { method: 'POST' }, token, signOut); await load(); }
    catch (value) { setError(value instanceof Error ? value.message : 'Action failed.'); }
    finally { setAction(''); }
  }
  async function deleteCrawl() {
    if (!token || !crawlId) return;
    setAction('delete'); setError('');
    try { await request(`/api/crawls/${encodeURIComponent(crawlId)}`, { method: 'DELETE' }, token, signOut); window.location.assign('/crawls'); }
    catch (value) { setError(value instanceof Error ? value.message : 'Delete failed.'); setAction(''); }
  }
  async function download(format: 'json' | 'markdown') {
    if (!token || !crawlId) return;
    setAction(`export-${format}`); setError('');
    try {
      const result = await exportCrawl(token, crawlId, format, signOut);
      const blob = new Blob([result.content ?? ''], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${crawlId}-report.${format === 'json' ? 'json' : 'md'}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (value) { setError(value instanceof Error ? value.message : 'Export failed.'); }
    finally { setAction(''); }
  }
  if (error && !crawl) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!crawl) return <LoadingState />;
  const normalized = crawl.status.toLowerCase();
  const target = crawl.target_domain ?? crawl.target_url ?? crawlId;
  const canPause = ['queued', 'running'].includes(normalized);
  const canResume = normalized === 'paused';
  return (
    <div className="space-stack">
      <Link to="/crawls" className="back-link"><ArrowLeft size={15} />Back to crawls</Link>
      <div className="detail-heading"><div><div className="eyebrow">Crawl detail</div><h1>{crawl.target_domain ?? crawl.target_url}</h1><p className="mono-text">{crawl.id}</p></div><div className="action-row"><StatusBadge status={crawl.status} /><span className={`stream-indicator stream-${streamState}`}>{streamState === 'connected' ? 'Live' : streamState === 'reconnecting' ? 'Reconnecting' : 'Offline'}</span>{canPause && <ActionButton label="Pause" name="pause" active={action} onClick={runAction} />}{canResume && <ActionButton label="Resume" name="resume" active={action} onClick={runAction} />}<button className="button button-quiet" onClick={() => void runAction('cancel')} disabled={action !== '' || ['completed', 'finished', 'cancelled', 'failed'].includes(normalized)}>Cancel</button></div></div>
      {isActiveStatus(crawl.status) && (
        <>
          <ProgressBar
            progress={crawl.pages_processed && crawl.pages_processed > 0 ? (crawl.pages_processed / Math.max(1, (crawl as unknown as { max_pages?: number }).max_pages ?? 10)) : undefined}
            label="Crawl progress"
            value={String(crawl.pages_processed ?? '—')}
          />
          {liveUrl && (
            <div className="live-activity"><span className="live-dot" /><span>Currently crawling</span><span className="live-url">{liveUrl}</span></div>
          )}
        </>
      )}
      {error && <div className="error-box" role="alert">{error}</div>}
      <section className="detail-grid"><Metric label="Status" value={labelForStatus(crawl.status)} /><Metric label="Pages processed" value={String(crawl.pages_processed ?? '—')} /><Metric label="Pages failed" value={String(crawl.pages_failed ?? '—')} /><Metric label="Findings" value={String(crawl.findings_count ?? '—')} /></section>
      <section className="panel detail-card"><div className="panel-header"><div><h2>Lifecycle actions</h2><p>Actions are sent to the API and may be rejected if the crawl state has changed.</p></div></div><div className="action-row detail-actions"><ActionButton label="Retry failed tasks" name="retry-failed" active={action} onClick={runAction} /><ActionButton label="Consolidate report" name="consolidate" active={action} onClick={runAction} /><button className="button button-quiet" onClick={() => void download('json')} disabled={action !== ''}>Export JSON</button><button className="button button-quiet" onClick={() => void download('markdown')} disabled={action !== ''}>Export Markdown</button><button className="button button-danger" onClick={() => setConfirmDelete(true)} disabled={action !== ''}>{action === 'delete' ? <LoaderCircle className="spin" size={14} /> : null}Delete crawl</button></div></section>{confirmDelete && <div className="dialog-layer" role="presentation"><section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="eyebrow">Permanent action</div><h2 id="delete-title">Delete this crawl?</h2><p className="dialog-copy">This permanently deletes <strong>{target}</strong>, including associated database records, Redis state, and storage assets. This cannot be undone.</p><div className="dialog-actions"><button className="button button-quiet" onClick={() => setConfirmDelete(false)}>Keep crawl</button><button className="button button-danger" onClick={() => { setConfirmDelete(false); void deleteCrawl(); }}>Delete permanently</button></div></section></div>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="kpi-card detail-metric"><div className="kpi-label">{label}</div><strong>{value}</strong></article>;
}
