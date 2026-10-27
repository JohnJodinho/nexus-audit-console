import { Activity, ArrowUpRight, BarChart3, BookOpen, ExternalLink, FileSearch, Gauge, Globe2, LayoutDashboard, LogOut, ShieldAlert, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { LogoMark } from '../components/brand/LogoMark';
import { crawlSectionPath, getCrawlRouteContext } from '../lib/routes';
import { appConfig } from '../config';

export function Sidebar({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) {
  const location = useLocation();
  const crawlContext = getCrawlRouteContext(location.pathname);
  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={open ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand"><LogoMark /><div><strong>Nexus</strong><span>Audit Console</span></div><button className="mobile-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button></div>
        <div className="workspace-switcher" aria-label="Current workspace"><span className="workspace-dot" /><span>Joule Dynamics</span></div>
        <nav className="sidebar-nav">
          <div className="nav-group">
            <NavItem to="/crawls" label="Overview" icon={LayoutDashboard} active={location.pathname === '/crawls'} />
            <NavItem to="/crawls" label="Crawls" icon={Globe2} active={location.pathname.startsWith('/crawls')} />
          </div>
          {crawlContext && <><div className="nav-section-label">Current crawl</div><div className="nav-group nav-subgroup">{[
            { label: 'Summary', icon: BarChart3 }, { label: 'Pages', icon: FileSearch }, { label: 'Findings', icon: ShieldAlert }, { label: 'Graph', icon: Activity }, { label: 'Operations', icon: Gauge },
          ].map(({ label, icon: Icon }, index) => {
            const section = index === 0 ? 'summary' : label.toLowerCase() as 'pages' | 'findings' | 'graph' | 'operations';
            return <Link className={crawlContext.section === section ? 'nav-item nav-item-sub active-sub' : 'nav-item nav-item-sub'} to={crawlSectionPath(crawlContext.crawlId, section)} key={label}><Icon size={16} />{label}</Link>;
          })}</div></>}
        </nav>
        <div className="sidebar-footer">
          <a href={appConfig.apiDocsUrl} target="_blank" rel="noreferrer" className="footer-link"><BookOpen size={16} />Documentation <ArrowUpRight size={13} /></a>
          {appConfig.publicSiteUrl && <a href={appConfig.publicSiteUrl} target="_blank" rel="noreferrer" className="footer-link"><ExternalLink size={16} />Joule Dynamics <ArrowUpRight size={13} /></a>}
          <div className="operator-row"><div className="operator-avatar">JD</div><div><strong>Operator</strong><span>Session active</span></div><button className="icon-button" aria-label="Sign out" onClick={onSignOut}><LogOut size={16} /></button></div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof Globe2; active: boolean }) {
  return <Link className={active ? 'nav-item nav-item-active' : 'nav-item'} to={to}><Icon size={17} />{label}</Link>;
}
