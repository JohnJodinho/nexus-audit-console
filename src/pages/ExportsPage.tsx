import { useCallback, useEffect, useState } from 'react';
import { Download, LoaderCircle, StopCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cancelExport, cancelExportPreview, createExport, createExportPreview, downloadExport, getExportPreviewStatus, getExportStatus } from '../api/client';
import { useExportPreviewStream } from '../api/use-export-preview-stream';
import type { ExportStatusResponse } from '../api/types';
import { useAuth } from '../auth';
import { ErrorState } from '../components/feedback/States';
import { canDownloadExport, isExportTerminal } from '../lib/export-status';

export function ExportsPage() {
  const { crawlId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [job, setJob] = useState<ExportStatusResponse | null>(null);
  const [preview, setPreview] = useState<ExportStatusResponse | null>(null);
  const [includeAssets, setIncludeAssets] = useState(false);
  const [error, setError] = useState('');
  const [previewEvents, setPreviewEvents] = useState<unknown[]>([]);
  const [streamState, setStreamState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const loadJob = useCallback(async () => { if (!token || !job?.job_id) return; setJob(await getExportStatus(token, crawlId, job.job_id, signOut)); }, [crawlId, job?.job_id, signOut, token]);
  useEffect(() => { if (!job || isExportTerminal(job.status)) return undefined; const timer = window.setInterval(() => { void loadJob(); }, 3000); return () => window.clearInterval(timer); }, [job, loadJob]);
  useEffect(() => { if (!token || !preview?.job_id || isExportTerminal(preview.status)) return undefined; const timer = window.setInterval(async () => setPreview(await getExportPreviewStatus(token, crawlId, preview.job_id, signOut)), 3000); return () => window.clearInterval(timer); }, [crawlId, preview, signOut, token]);
  useExportPreviewStream({ token, crawlId, previewId: preview?.job_id ?? null, onEvent: (event) => setPreviewEvents((items) => [...items, event.data]), onStateChange: setStreamState, onUnauthorized: signOut, onError: setError });
  async function startExport() {
    if (!token) return;
    setError('');
    try { const created = await createExport(token, crawlId, { format: 'markdown', include_assets: includeAssets, include_metadata: true, include_manifest: true }, signOut); setJob(created); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to start export.'); }
  }
  async function startPreview() {
    if (!token) return;
    setError('');
    try { const created = await createExportPreview(token, crawlId, { format: 'markdown', include_assets: includeAssets }, signOut); setPreview(created); setPreviewEvents([]); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to start export preview.'); }
  }
  async function cancel(kind: 'export' | 'preview') {
    if (!token) return;
    try { if (kind === 'export' && job) setJob(await cancelExport(token, crawlId, job.job_id, signOut)); if (kind === 'preview' && preview) setPreview(await cancelExportPreview(token, crawlId, preview.job_id, signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to cancel job.'); }
  }
  async function download() {
    if (!token || !job || !canDownloadExport(job.status)) return;
    try { const result = await downloadExport(token, crawlId, job.job_id, signOut); const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(result.blob); anchor.download = `${crawlId}-export.zip`; anchor.click(); URL.revokeObjectURL(anchor.href); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to download export.'); }
  }
  return <div className="space-stack"><div className="page-heading"><div><div className="eyebrow">Content exports</div><h1>Exports</h1><p>Server-managed archive jobs are separate from legacy report exports.</p></div></div>{error && <ErrorState message={error} onRetry={() => setError('')} />}<section className="panel export-options"><label className="checkbox-filter"><input type="checkbox" checked={includeAssets} onChange={(event) => setIncludeAssets(event.target.checked)} />Include assets</label><div className="action-row"><button className="button button-primary" onClick={() => void startExport()} disabled={Boolean(job && !isExportTerminal(job.status))}><LoaderCircle size={15} />Create archive</button><button className="button button-quiet" onClick={() => void startPreview()} disabled={Boolean(preview && !isExportTerminal(preview.status))}>Preview export</button></div></section>{job && <JobCard title="Archive job" job={job} onCancel={() => void cancel('export')} onDownload={() => void download()} />} {preview && <JobCard title={`Preview job · ${streamState}`} job={preview} onCancel={() => void cancel('preview')} />} {previewEvents.length > 0 && <section className="panel result-panel"><div className="panel-header"><div><h2>Preview decisions</h2><p>Live event payloads from the authenticated preview stream.</p></div></div><pre className="json-output">{JSON.stringify(previewEvents, null, 2)}</pre></section>}</div>;
}

function JobCard({ title, job, onCancel, onDownload }: { title: string; job: ExportStatusResponse; onCancel: () => void; onDownload?: () => void }) {
  return <section className="panel job-card"><div><div className="eyebrow">{title}</div><h2>{job.status}</h2><p className="mono-text">{job.job_id}</p>{job.error_message && <div className="error-box">{job.error_message}</div>}</div><div className="action-row">{onDownload && <button className="button button-primary" disabled={!canDownloadExport(job.status)} onClick={onDownload}><Download size={15} />Download</button>} {!isExportTerminal(job.status) && <button className="button button-danger" onClick={onCancel}><StopCircle size={15} />Cancel</button>}</div></section>;
}
