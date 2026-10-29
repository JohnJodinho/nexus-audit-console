import { useCallback, useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { listFindings, updateFindingStatus } from '../api/client';
import { useCrawlEventStream } from '../api/use-crawl-event-stream';
import type { Finding, PaginatedResponse } from '../api/types';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

const filters = ['category', 'severity', 'canvas_zone', 'status'] as const;
const choices: Record<typeof filters[number], string[]> = { category: ['seo', 'security', 'performance', 'accessibility'], severity: ['critical', 'warning', 'info'], canvas_zone: ['nav', 'head', 'content', 'footer', 'server'], status: ['open', 'approved', 'rejected', 'pending_review'] };

export function FindingsPage() {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [data, setData] = useState<PaginatedResponse<Finding> | null>(null);
  const [query, setQuery] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [streamState, setStreamState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try { setData(await listFindings(token, crawlId, page, 50, query, signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load findings.'); }
  }, [token, crawlId, page, query, signOut]);
  useEffect(() => { void load(); }, [load]);

  // SSE: live updates for finding status changes and new findings
  useCrawlEventStream({
    token,
    crawlId,
    onEvent: (event) => {
      if (event.event === 'resync_required') { void load(); return; }
      const data = event.data as Record<string, unknown> | undefined;
      if (event.event === 'finding.status_changed' && data) {
        // Update the specific finding row in place
        const findingId = data.finding_id as string | undefined;
        const newStatus = data.status as string | undefined;
        if (findingId && newStatus) {
          setData(prev => {
            if (!prev) return prev;
            const findings = (prev.findings ?? []) as Finding[];
            return {
              ...prev,
              findings: findings.map(f => f.id === findingId ? { ...f, status: newStatus } : f),
            };
          });
          return;
        }
      }
      if (event.event === 'page.available' || event.event === 'crawl.completed' || event.event === 'crawl.deleted') {
        void load();
        return;
      }
    },
    onStateChange: setStreamState,
    onUnauthorized: signOut,
  });
  async function changeStatus(findingId: string, status: string) {
    if (!token) return;
    setSaving(findingId);
    try { await updateFindingStatus(token, crawlId, findingId, status, signOut); await load(); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to update finding.'); }
    finally { setSaving(''); }
  }
  if (error && !data) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return <LoadingState />;
  const rows = (data.findings ?? []) as Finding[];
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Crawl review</div><h1>Findings</h1><p>Filter findings server-side and update their review state.</p></div><div className={`stream-indicator stream-${streamState}`}>{streamState === 'connected' ? 'Live' : streamState === 'reconnecting' ? 'Reconnecting' : 'Offline'}</div><Link className="button button-quiet" to={`/crawls/${crawlId}`}>Back to summary</Link></div>{error && <div className="error-box" role="alert">{error}</div>}<section className="panel"><div className="finding-filters">{filters.map((filter) => <label className="select-field" key={filter}><span className="sr-only">{filter.replace('_', ' ')}</span><select aria-label={filter.replace('_', ' ')} value={query[filter] ?? ''} onChange={(event) => { setQuery({ ...query, [filter]: event.target.value }); setPage(1); }}><option value="">All {filter.replace('_', ' ')}</option>{choices[filter].map((choice) => <option value={choice} key={choice}>{choice}</option>)}</select></label>)}</div><div className="table-wrap"><table><thead><tr><th scope="col">Finding</th><th scope="col">Category</th><th scope="col">Severity</th><th scope="col">Zone</th><th scope="col">Review status</th></tr></thead><tbody>{rows.map((finding) => <tr key={finding.id}><td><strong className="finding-title">{finding.title ?? finding.description ?? finding.id}</strong><span className="finding-evidence">{finding.page_url ?? 'No page URL returned'}</span></td><td>{finding.category ?? '—'}</td><td><span className={`severity severity-${finding.severity}`}>{finding.severity ?? '—'}</span></td><td>{finding.canvas_zone ?? '—'}</td><td><label className="status-select"><select value={finding.status ?? 'open'} disabled={saving === finding.id} onChange={(event) => void changeStatus(finding.id, event.target.value)}><option value="open">Open</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="pending_review">Pending review</option></select>{saving === finding.id ? <LoaderCircle size={13} className="spin" /> : <Check size={13} />}</label></td></tr>)}{rows.length === 0 && <tr><td className="empty-row" colSpan={5}>No findings returned for this view.</td></tr>}</tbody></table></div></section></div>;
}
