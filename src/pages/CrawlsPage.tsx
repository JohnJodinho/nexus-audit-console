import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, LoaderCircle, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError, listCrawls } from '../api/client';
import { startEventStream } from '../api/sse';
import type { CrawlListItem } from '../api/types';
import { useAuth } from '../auth';
import { CrawlTable } from '../components/crawl/CrawlTable';
import { KpiStrip } from '../components/crawl/KpiStrip';
import { Pagination } from '../components/crawl/Pagination';
import { ErrorState, LoadingState } from '../components/feedback/States';
import { statusLabels, isActiveStatus } from '../data/crawl-status';

export function CrawlsPage() {
  const { token, signOut } = useAuth();
  const [params, setParams] = useSearchParams();
  const [response, setResponse] = useState<{ total: number; limit: number; offset: number; crawls: CrawlListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamState, setStreamState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const domain = params.get('domain') ?? '';
  const status = params.get('status') ?? '';
  const page = Math.max(0, Number(params.get('page') ?? '0') || 0);
  const limit = 20;
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try { setResponse(await listCrawls(token, { domain, status, limit, offset: page * limit }, signOut)); }
    catch (value) { if (value instanceof ApiError && value.status !== 401) setError(value.message); else if (!(value instanceof ApiError)) setError('Unable to load crawls.'); }
    finally { setLoading(false); }
  }, [token, domain, status, page, signOut]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!token) return undefined;
    return startEventStream(token, { onEvent: (event) => { if (event.event === 'resync_required' || event.event.startsWith('crawl.') || event.event === 'action.outcome') void load(); }, onStateChange: setStreamState, onUnauthorized: signOut });
  }, [token, load, signOut]);
  const updateFilter = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete('page'); setParams(next); };
  const totalPages = Math.max(1, Math.ceil((response?.total ?? 0) / limit));
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Overview</div><h1>Crawls</h1><p>Monitor web audits and review the issues they surface.</p></div><Link className="button button-primary" to="/crawls/new"><Plus size={16} />New crawl</Link></div><KpiStrip total={response?.total} active={response?.crawls.filter((crawl) => isActiveStatus(crawl.status)).length} /><section className="panel crawl-panel"><div className="panel-header"><div><h2>Recent crawl activity</h2><p>{response ? `${response.total} crawls matching the current scope` : 'Loading crawl inventory'}</p></div><div className="panel-actions"><div className={`stream-indicator stream-${streamState}`}><span />{streamState === 'connected' ? 'Live' : streamState === 'reconnecting' ? 'Reconnecting' : 'Offline'}</div><button className="button button-quiet" onClick={() => void load()} disabled={loading}>{loading ? <LoaderCircle className="spin" size={15} /> : null}Refresh</button></div></div><div className="filter-row"><label className="search-field"><Search size={16} /><input type="search" placeholder="Search domains" value={domain} onChange={(event) => updateFilter('domain', event.target.value)} /></label><label className="select-field"><select value={status} onChange={(event) => updateFilter('status', event.target.value)}><option value="">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={15} /></label></div>{loading && !response ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : <><CrawlTable rows={response?.crawls ?? []} /><Pagination page={page} totalPages={totalPages} onChange={(next) => { const query = new URLSearchParams(params); query.set('page', String(next)); setParams(query); }} /></>}</section></div>;
}
