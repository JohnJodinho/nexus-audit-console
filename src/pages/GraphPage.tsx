import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGraph } from '../api/client';
import type { GraphResponse } from '../api/types';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

export function GraphPage() {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    try { setGraph(await getGraph(token, crawlId, signOut)); } catch (value) { setError(value instanceof Error ? value.message : 'Unable to load graph.'); }
  }, [token, crawlId, signOut]);
  useEffect(() => { void load(); }, [load]);
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!graph) return <LoadingState />;
  const nodeCount = graph.nodes?.length ?? 0;
  const edgeCount = graph.edges?.length ?? 0;
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Crawl topology</div><h1>Graph</h1><p>Bounded graph response for this crawl.</p></div><Link className="button button-quiet" to={`/crawls/${crawlId}`}>Back to summary</Link></div><section className="panel graph-empty"><div className="graph-orbit"><span /><span /><span /><span /></div><h2>{nodeCount === 0 ? 'No graph data returned' : 'Graph data ready'}</h2><p>{nodeCount === 0 ? 'The API returned an empty graph for this crawl.' : `${nodeCount} nodes and ${edgeCount} edges are available for the graph renderer.`}</p></section></div>;
}
