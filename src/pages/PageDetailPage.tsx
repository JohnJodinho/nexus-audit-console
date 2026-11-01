import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPageLinks, getPageMetadata } from '../api/client';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

export function PageDetailPage() {
  const { crawlId = '', pageId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [data, setData] = useState<unknown>(null);
  const [view, setView] = useState<'links' | 'metadata'>('links');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    try { setData(view === 'links' ? await getPageLinks(token, crawlId, Number(pageId), undefined, signOut) : await getPageMetadata(token, crawlId, Number(pageId), signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load page inspection.'); }
  }, [crawlId, pageId, signOut, token, view]);
  useEffect(() => { void load(); }, [load]);
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (data === null) return <LoadingState />;
  return <div className="space-stack"><Link to={`/crawls/${crawlId}/pages`} className="back-link"><ArrowLeft size={15} />Back to pages</Link><div className="page-heading"><div><div className="eyebrow">Page {pageId}</div><h1>Page inspection</h1><p>Inspect server-returned relationships and metadata.</p></div></div><div className="tab-row"><button className={view === 'links' ? 'tab-button tab-active' : 'tab-button'} onClick={() => setView('links')}>Links</button><button className={view === 'metadata' ? 'tab-button tab-active' : 'tab-button'} onClick={() => setView('metadata')}>Metadata</button><Link className="button button-quiet" to={`/crawls/${crawlId}/pages/${pageId}/content`}>View content</Link></div><section className="panel result-panel"><pre className="json-output">{JSON.stringify(data, null, 2)}</pre></section></div>;
}
