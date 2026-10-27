import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';

export function CrawlWorkspaceLayout() {
  const { crawlId } = useParams();

  useEffect(() => {
    document.title = crawlId ? `Crawl ${crawlId} | Nexus Audit Console` : 'Nexus Audit Console';
    return () => {
      document.title = 'Nexus Audit Console | Joule Dynamics';
    };
  }, [crawlId]);

  return <Outlet />;
}
