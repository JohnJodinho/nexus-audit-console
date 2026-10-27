import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDlq, getTelemetry } from '../api/client';
import type { DlqResponse, Telemetry } from '../api/types';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

export function OperationsPage() {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [dlq, setDlq] = useState<DlqResponse | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    try { const [telemetryResult, dlqResult] = await Promise.all([getTelemetry(token, crawlId, signOut), getDlq(token, crawlId, signOut)]); setTelemetry(telemetryResult); setDlq(dlqResult); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load operations data.'); }
  }, [token, crawlId, signOut]);
  useEffect(() => { void load(); }, [load]);
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!telemetry || !dlq) return <LoadingState />;
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Runtime telemetry</div><h1>Operations</h1><p>Monitor dropped links and dead-letter queue activity.</p></div><Link className="button button-quiet" to={`/crawls/${crawlId}`}>Back to summary</Link></div><div className="detail-grid"><Metric label="Dropped links" value={readMetric(telemetry, 'total_dropped_links')} /><Metric label="DLQ items" value={readMetric(dlq, 'count', 'total')} /><Metric label="Reason groups" value={readMetric(telemetry, 'reason_counts', 'reasons')} /><Metric label="Recent events" value={readMetric(telemetry, 'recent_events', 'events')} /></div><section className="panel detail-card"><div className="panel-header"><div><h2>Operational payload</h2><p>Raw API response is shown as escaped JSON for inspection.</p></div></div><pre className="json-preview">{JSON.stringify({ telemetry, dlq }, null, 2)}</pre></section></div>;
}

function readMetric(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'number' || typeof value === 'string') return String(value);
    if (Array.isArray(value)) return String(value.length);
    if (value && typeof value === 'object') return String(Object.keys(value).length);
  }
  return '—';
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="kpi-card detail-metric"><div className="kpi-label">{label}</div><strong>{value}</strong></article>;
}
