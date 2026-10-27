import { useState } from 'react';
import { ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createCrawl } from '../api/client';
import { useAuth } from '../auth';

export function NewCrawlPage() {
  const { token, signOut } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [workerCount, setWorkerCount] = useState('2');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!token) return;
    setSubmitting(true); setError(''); setResult('');
    try {
      const config = { ...(maxPages ? { max_pages: Number(maxPages) } : {}), ...(maxDepth ? { max_depth: Number(maxDepth) } : {}), worker_count: Number(workerCount) };
      const created = await createCrawl(token, { url: url.trim(), config }, signOut);
      setResult(created.duplicate ? 'A crawl for this request already exists.' : created.message ?? 'Crawl created successfully.');
      if (created.id ?? created.crawl_id) window.setTimeout(() => navigate(`/crawls/${created.id ?? created.crawl_id}`), 700);
    } catch (value) { setError(value instanceof Error ? value.message : 'Unable to create crawl.'); }
    finally { setSubmitting(false); }
  }
  return <div className="form-page"><Link to="/crawls" className="back-link"><ArrowLeft size={15} />Back to crawls</Link><div className="page-heading"><div><div className="eyebrow">Create audit</div><h1>New crawl</h1><p>Start a crawl using the API defaults, with optional limits below.</p></div></div><section className="panel create-panel"><form onSubmit={submit}><label className="form-label">Target URL<input className="form-input" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" type="url" required /></label><div className="advanced-heading"><div><h2>Advanced configuration</h2><p>Optional settings are sent only when you change them.</p></div></div><div className="form-grid"><label className="form-label">Max pages<input className="form-input" value={maxPages} onChange={(event) => setMaxPages(event.target.value)} type="number" min="1" placeholder="API default" /></label><label className="form-label">Max depth<input className="form-input" value={maxDepth} onChange={(event) => setMaxDepth(event.target.value)} type="number" min="0" placeholder="API default" /></label><label className="form-label">Worker count<select className="form-input" value={workerCount} onChange={(event) => setWorkerCount(event.target.value)}><option value="1">1 worker</option><option value="2">2 workers</option><option value="3">3 workers</option><option value="4">4 workers</option></select></label></div>{error && <div className="error-box" role="alert">{error}</div>}{result && <div className="success-box" role="status"><Check size={16} />{result}</div>}<div className="dialog-actions"><Link className="button button-quiet" to="/crawls">Cancel</Link><button className="button button-primary" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={16} /> : null}{submitting ? 'Creating…' : 'Create crawl'}</button></div></form></section></div>;
}
