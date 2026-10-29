import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { listPages } from '../api/client';
import { useCrawlEventStream } from '../api/use-crawl-event-stream';
import type { CrawlPage, PaginatedResponse } from '../api/types';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

export function PagesPage() {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [data, setData] = useState<PaginatedResponse<CrawlPage> | null>(null);
  const [page, setPage] = useState(1);
  const [hasFindings, setHasFindings] = useState(false);
  const [error, setError] = useState('');
  const [streamState, setStreamState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try { setData(await listPages(token, crawlId, page, 50, hasFindings, signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load pages.'); }
  }, [token, crawlId, page, hasFindings, signOut]);
  useEffect(() => { void load(); }, [load]);

  // SSE: live updates when new pages become available
  useCrawlEventStream({
    token,
    crawlId,
    onEvent: (event) => {
      if (event.event === 'resync_required') { void load(); return; }
      if (event.event === 'page.available') {
        // New page discovered — refresh the page list incrementally
        void load();
        return;
      }
      if (event.event === 'crawl.completed' || event.event === 'crawl.deleted') { void load(); return; }
    },
    onStateChange: setStreamState,
    onUnauthorized: signOut,
  });
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return <LoadingState />;
  const rows = (data.pages ?? []) as CrawlPage[];
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Crawl pages</div><h1>Pages</h1><p>Browse pages discovered during this crawl.</p></div><div className={`stream-indicator stream-${streamState}`}>{streamState === 'connected' ? 'Live' : streamState === 'reconnecting' ? 'Reconnecting' : 'Offline'}</div><Link className="button button-quiet" to={`/crawls/${crawlId}`}>Back to summary</Link></div><section className="panel"><div className="filter-row"><label className="checkbox-filter"><input type="checkbox" checked={hasFindings} onChange={(event) => { setHasFindings(event.target.checked); setPage(1); }} />Only pages with findings</label><button className="button button-quiet" onClick={() => void load()}><LoaderCircle size={15} className={data ? '' : 'spin'} />Refresh</button></div><div className="table-wrap"><table>  <thead><tr><th scope="col">Page URL</th><th scope="col">Status code</th><th scope="col">Findings</th><th scope="col">Page ID</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td className="url-cell">{item.url ?? '—'}</td><td className="numeric">{item.status_code ?? '—'}</td><td className="numeric findings-number">{item.findings_count ?? 0}</td><td className="mono-text">{item.id}</td></tr>)}{rows.length === 0 && <tr><td className="empty-row" colSpan={4}>No pages returned for this view.</td></tr>}</tbody></table></div><div className="pagination"><span>{data.total} pages</span><div><button className="button button-quiet" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="button button-quiet" disabled={page >= data.total_pages} onClick={() => setPage((value) => value + 1)}>Next</button></div></div></section></div>;
}
