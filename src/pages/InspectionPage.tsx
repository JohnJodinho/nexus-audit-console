import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getArtifacts, getContacts, getCrawlEvents, getFailures, getPaths, getStatistics, searchCrawl } from '../api/client';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

type InspectionKind = 'paths' | 'contacts' | 'search' | 'statistics' | 'failures' | 'artifacts' | 'events';
const labels: Record<InspectionKind, string> = { paths: 'Paths', contacts: 'Contacts', search: 'Search', statistics: 'Statistics', failures: 'Failures', artifacts: 'Artifacts', events: 'Events' };

export function InspectionPage({ kind }: { kind: InspectionKind }) {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [data, setData] = useState<unknown>(null);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const result = kind === 'paths' ? await getPaths(token, crawlId, signOut)
        : kind === 'contacts' ? await getContacts(token, crawlId, {}, signOut)
          : kind === 'search' ? await searchCrawl(token, crawlId, submittedQuery, 1, 50, signOut)
            : kind === 'statistics' ? await getStatistics(token, crawlId, signOut)
              : kind === 'failures' ? await getFailures(token, crawlId, signOut)
                : kind === 'artifacts' ? await getArtifacts(token, crawlId, {}, signOut)
                  : await getCrawlEvents(token, crawlId, undefined, signOut);
      setData(result);
    } catch (value) { setError(value instanceof Error ? value.message : `Unable to load ${labels[kind].toLowerCase()}.`); }
  }, [crawlId, kind, signOut, submittedQuery, token]);
  useEffect(() => { if (kind !== 'search' || submittedQuery) void load(); }, [kind, load, submittedQuery]);
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (data === null) return <LoadingState />;
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Crawl inspection</div><h1>{labels[kind]}</h1><p>Read-only data returned by the crawl API.</p></div><button className="button button-quiet" onClick={() => void load()}><LoaderCircle size={15} />Refresh</button></div>{kind === 'search' && <form className="inline-search" onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query.trim()); }}><input className="form-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search indexed pages" required /><button className="button button-primary">Search</button></form>}<section className="panel result-panel"><pre className="json-output">{JSON.stringify(data, null, 2)}</pre></section></div>;
}
