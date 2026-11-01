import { useState } from 'react';
import { ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, createCrawl } from '../api/client';
import { useAuth } from '../auth';
import { PatternEditor } from '../components/url-rules/PatternEditor';

const resourceTypes = ['image', 'document', 'stylesheet', 'script', 'font', 'media'];

export function NewCrawlPage() {
  const { token, signOut } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [workerCount, setWorkerCount] = useState('2');
  const [includePatterns, setIncludePatterns] = useState<string[]>([]);
  const [excludePatterns, setExcludePatterns] = useState<string[]>([]);
  const [excludeResourceTypes, setExcludeResourceTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [invalidPattern, setInvalidPattern] = useState('');
  const [result, setResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!token) return;
    setSubmitting(true); setError(''); setInvalidPattern(''); setResult('');
    try {
      const config = {
        ...(maxPages ? { max_pages: Number(maxPages) } : {}),
        ...(maxDepth ? { max_depth: Number(maxDepth) } : {}),
        worker_count: Number(workerCount),
        include_patterns: includePatterns,
        exclude_patterns: excludePatterns,
        exclude_resource_types: excludeResourceTypes,
      };
      const created = await createCrawl(token, { url: url.trim(), config }, signOut);
      setResult(created.is_duplicate ? 'A crawl for this request already exists.' : created.message);
      window.setTimeout(() => navigate(`/crawls/${created.crawl_id}`), 700);
    } catch (value) {
      if (value instanceof ApiError) {
        setError(value.message);
        if (value.pattern) setInvalidPattern(value.pattern);
      } else setError(value instanceof Error ? value.message : 'Unable to create crawl.');
    } finally { setSubmitting(false); }
  }
  return <div className="form-page"><Link to="/crawls" className="back-link"><ArrowLeft size={15} />Back to crawls</Link><div className="page-heading"><div><div className="eyebrow">Create audit</div><h1>New crawl</h1><p>Configure server-side crawl rules and limits before starting.</p></div></div><section className="panel create-panel"><form onSubmit={submit}><label className="form-label">Target URL<input className="form-input" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" type="url" required /></label><div className="advanced-heading"><div><h2>Advanced configuration</h2><p>Patterns are submitted unchanged after chip commitment.</p></div></div><div className="form-grid"><label className="form-label">Max pages<input className="form-input" value={maxPages} onChange={(event) => setMaxPages(event.target.value)} type="number" min="1" placeholder="API default" /></label><label className="form-label">Max depth<input className="form-input" value={maxDepth} onChange={(event) => setMaxDepth(event.target.value)} type="number" min="0" placeholder="API default" /></label><label className="form-label">Worker count<select className="form-input" value={workerCount} onChange={(event) => setWorkerCount(event.target.value)}><option value="1">1 worker</option><option value="2">2 workers</option><option value="3">3 workers</option><option value="4">4 workers</option></select></label></div><div className="pattern-grid"><PatternEditor label="Include patterns" value={includePatterns} onChange={setIncludePatterns} invalidPattern={invalidPattern} /><PatternEditor label="Exclude patterns" value={excludePatterns} onChange={setExcludePatterns} invalidPattern={invalidPattern} /></div><fieldset className="resource-options"><legend className="form-label">Exclude resource types</legend><div className="checkbox-grid">{resourceTypes.map((type) => <label className="checkbox-filter" key={type}><input type="checkbox" checked={excludeResourceTypes.includes(type)} onChange={(event) => setExcludeResourceTypes(event.target.checked ? [...excludeResourceTypes, type] : excludeResourceTypes.filter((item) => item !== type))} />{type}</label>)}</div></fieldset>{error && <div className="error-box" role="alert">{error}{invalidPattern && <strong className="error-detail"> Pattern: {invalidPattern}</strong>}</div>}{result && <div className="success-box" role="status"><Check size={16} />{result}</div>}<div className="dialog-actions"><Link className="button button-quiet" to="/crawls">Cancel</Link><button className="button button-primary" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={16} /> : null}{submitting ? 'Creating…' : 'Create crawl'}</button></div></form></section></div>;
}
