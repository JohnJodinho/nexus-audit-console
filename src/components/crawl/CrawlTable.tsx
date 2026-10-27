import { Globe2, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CrawlListItem } from '../../api/types';
import { formatDate } from '../../lib/format';
import { StatusBadge } from './StatusBadge';

export function CrawlTable({ rows }: { rows: CrawlListItem[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th scope="col">Target</th><th scope="col">Status</th><th scope="col">Pages</th><th scope="col">Failed</th><th scope="col">Findings</th><th scope="col">Last updated</th><th scope="col" aria-label="Actions" /></tr></thead>
        <tbody>
          {rows.map((crawl) => (
            <tr key={crawl.id}>
              <td><Link to={`/crawls/${encodeURIComponent(crawl.id)}`} className="target-cell"><div className="target-icon"><Globe2 size={16} /></div><div><strong>{crawl.target_domain ?? crawl.target_url}</strong><span>{crawl.id}</span></div></Link></td>
              <td><StatusBadge status={crawl.status} /></td>
              <td className="numeric">{crawl.pages_processed ?? '—'}</td>
              <td className="numeric">{crawl.pages_failed ?? '—'}</td>
              <td className="numeric findings-number">{crawl.findings_count ?? '—'}</td>
              <td className="updated-cell">{formatDate(crawl.updated_at)}</td>
              <td className="row-actions">
                <button
                  className="row-menu"
                  aria-label={`Actions for ${crawl.target_domain ?? crawl.target_url}`}
                  aria-expanded={openMenu === crawl.id}
                  onClick={() => setOpenMenu((current) => current === crawl.id ? null : crawl.id)}
                >
                  <MoreHorizontal size={17} />
                </button>
                {openMenu === crawl.id && (
                  <div className="row-action-menu" role="menu">
                    <Link role="menuitem" to={`/crawls/${encodeURIComponent(crawl.id)}`} onClick={() => setOpenMenu(null)}>Open summary</Link>
                    <Link role="menuitem" to={`/crawls/${encodeURIComponent(crawl.id)}/pages`} onClick={() => setOpenMenu(null)}>View pages</Link>
                    <Link role="menuitem" to={`/crawls/${encodeURIComponent(crawl.id)}/findings`} onClick={() => setOpenMenu(null)}>Review findings</Link>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className="empty-row" colSpan={7}><Search size={20} />No crawls match these filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
