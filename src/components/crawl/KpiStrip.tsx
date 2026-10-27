export function KpiStrip({ total, active }: { total?: number; active?: number }) {
  return (
    <section className="kpi-grid" aria-label="Crawl metrics">
      <article className="kpi-card"><div className="kpi-label">Crawls in scope <span className="kpi-note">Current results</span></div><strong>{total ?? '—'}</strong><span className="kpi-trend trend-neutral">API total</span></article>
      <article className="kpi-card"><div className="kpi-label">Active on this page <span className="kpi-note">Current results</span></div><strong>{active ?? '—'}</strong><span className="kpi-trend trend-up">Live status</span></article>
      <article className="kpi-card"><div className="kpi-label">Data source <span className="kpi-note">Authoritative</span></div><strong className="kpi-word">REST</strong><span className="kpi-trend trend-up">SSE invalidation enabled</span></article>
    </section>
  );
}
