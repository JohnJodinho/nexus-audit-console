import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { downloadPageContent, getPageContent } from '../api/client';
import { useAuth } from '../auth';
import { ErrorState, LoadingState } from '../components/feedback/States';

export function PageContentPage() {
  const { crawlId = '', pageId = '' } = useParams();
  const { token, signOut } = useAuth();
  const [format, setFormat] = useState('markdown');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [content, setContent] = useState<unknown>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try { setContent(await getPageContent(token, crawlId, Number(pageId), { format, includeMetadata }, signOut)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load page content.'); }
  }, [crawlId, format, includeMetadata, pageId, signOut, token]);
  useEffect(() => { void load(); }, [load]);
  async function download() {
    if (!token) return;
    try {
      const result = await downloadPageContent(token, crawlId, Number(pageId), format, includeMetadata, signOut);
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(result.blob);
      anchor.download = `${crawlId}-page-${pageId}.${format === 'markdown' ? 'md' : format}`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch (value) { setError(value instanceof Error ? value.message : 'Unable to download content.'); }
  }
  if (error && content === null) return <ErrorState message={error} onRetry={() => void load()} />;
  if (content === null) return <LoadingState />;
  return <div className="space-stack"><Link to={`/crawls/${crawlId}/pages/${pageId}`} className="back-link"><ArrowLeft size={15} />Back to page</Link><div className="page-heading"><div><div className="eyebrow">Page content</div><h1>Stored representation</h1><p>Content is displayed as text and is never executed in the console.</p></div><button className="button button-quiet" onClick={() => void download()}><Download size={15} />Download</button></div><div className="content-toolbar"><label className="form-label">Representation<select className="form-input" value={format} onChange={(event) => setFormat(event.target.value)}><option value="markdown">Markdown</option><option value="html">HTML</option><option value="text">Text</option></select></label><label className="checkbox-filter"><input type="checkbox" checked={includeMetadata} onChange={(event) => setIncludeMetadata(event.target.checked)} />Include metadata</label></div>{error && <div className="error-box" role="alert">{error}</div>}<section className="panel"><pre className="content-output">{typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</pre></section></div>;
}
