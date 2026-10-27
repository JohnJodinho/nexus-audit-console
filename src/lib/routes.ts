const crawlChildRoutes = new Set(['pages', 'findings', 'graph', 'operations']);

export type CrawlRouteContext = {
  crawlId: string;
  section: 'summary' | 'pages' | 'findings' | 'graph' | 'operations';
};

export function getCrawlRouteContext(pathname: string): CrawlRouteContext | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'crawls' || !segments[1] || segments[1] === 'new') return null;
  const child = segments[2];
  if (child && !crawlChildRoutes.has(child)) return null;
  return {
    crawlId: decodeURIComponent(segments[1]),
    section: (child ?? 'summary') as CrawlRouteContext['section'],
  };
}

export function crawlSectionPath(crawlId: string, section: CrawlRouteContext['section']) {
  return section === 'summary'
    ? `/crawls/${encodeURIComponent(crawlId)}`
    : `/crawls/${encodeURIComponent(crawlId)}/${section}`;
}
