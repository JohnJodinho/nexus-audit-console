import { useRef, useState } from 'react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { previewUrlRules } from '../api/client';
import { useAuth } from '../auth';
import { PatternEditor } from '../components/url-rules/PatternEditor';

export function UrlRulesPreviewPage() {
  const { token, signOut } = useAuth();
  const [targetUrl, setTargetUrl] = useState('');
  const [sampleUrls, setSampleUrls] = useState<string[]>([]);
  const [includePatterns, setIncludePatterns] = useState<string[]>([]);
  const [excludePatterns, setExcludePatterns] = useState<string[]>([]);
  const [sampleInput, setSampleInput] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  function addSample(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();
    const sample = sampleInput.trim();
    if (sample && !sampleUrls.includes(sample)) setSampleUrls([...sampleUrls, sample]);
    setSampleInput('');
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    controller.current?.abort();
    controller.current = new AbortController();
    setLoading(true); setError('');
    try {
      setResult(await previewUrlRules(token, { target_url: targetUrl.trim(), sample_urls: sampleUrls, include_patterns: includePatterns, exclude_patterns: excludePatterns }, controller.current.signal, signOut));
    } catch (value) {
      if (value instanceof DOMException && value.name === 'AbortError') return;
      setError(value instanceof Error ? value.message : 'Unable to preview URL rules.');
    } finally { setLoading(false); }
  }
  return <div className="space-stack"><Link to="/crawls" className="back-link"><ArrowLeft size={15} />Back to crawls</Link><div className="page-heading"><div><div className="eyebrow">Rule inspection</div><h1>URL-rule preview</h1><p>Evaluate server-side inclusion and exclusion rules without creating a crawl.</p></div></div><section className="panel create-panel"><form onSubmit={submit}><label className="form-label">Target URL<input className="form-input" required type="url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://example.com" /></label><div className="pattern-editor"><span className="form-label">Sample URLs</span><div className="pattern-chip-box">{sampleUrls.map((url) => <span className="pattern-chip" key={url}><span>{url}</span><button type="button" aria-label={`Remove ${url}`} onClick={() => setSampleUrls(sampleUrls.filter((item) => item !== url))}>×</button></span>)}<input value={sampleInput} onChange={(event) => setSampleInput(event.target.value)} onKeyDown={addSample} placeholder="Enter sample URL" /></div></div><PatternEditor label="Include patterns" value={includePatterns} onChange={setIncludePatterns} /><PatternEditor label="Exclude patterns" value={excludePatterns} onChange={setExcludePatterns} />{error && <div className="error-box" role="alert">{error}</div>}<div className="dialog-actions"><button className="button button-primary" disabled={loading}>{loading && <LoaderCircle className="spin" size={15} />}{loading ? 'Evaluating…' : 'Preview rules'}</button></div></form></section>{result !== null && <section className="panel result-panel"><div className="panel-header"><div><h2>Server response</h2><p>Rendered as returned by the API.</p></div></div><pre className="json-output">{JSON.stringify(result, null, 2)}</pre></section>}</div>;
}
