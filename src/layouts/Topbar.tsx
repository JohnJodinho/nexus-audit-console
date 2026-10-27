import { useState } from 'react';
import { CircleHelp, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react';
import { appConfig } from '../config';

export function Topbar({ darkMode, onMenu, onToggleTheme, onSignOut }: { darkMode: boolean; onMenu: () => void; onToggleTheme: () => void; onSignOut: () => void }) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="breadcrumbs"><button className="mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={19} /></button><span>Home</span><ChevronRight size={14} /><strong>Crawls</strong></div>
        <div className="topbar-actions">
          <div className="connection-status"><span className="connection-dot" />Authenticated</div>
          <button className="icon-button" aria-label="Open help" aria-expanded={helpOpen} onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button>
          <button className="icon-button" aria-label="Toggle theme" onClick={onToggleTheme}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="topbar-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </header>
      {helpOpen && <div className="dialog-layer" role="presentation" onClick={() => setHelpOpen(false)}><section className="dialog help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}><div className="dialog-heading"><div><div className="eyebrow">Console help</div><h2 id="help-title">Nexus Audit Console</h2></div><button className="icon-button" aria-label="Close help" onClick={() => setHelpOpen(false)}><X size={17} /></button></div><p className="dialog-copy">Use the crawl workspace to monitor progress, inspect discovered pages, review findings, and access operational telemetry.</p><div className="help-links"><a href={appConfig.apiDocsUrl} target="_blank" rel="noreferrer">Open API documentation</a>{appConfig.supportEmail && <a href={`mailto:${appConfig.supportEmail}`}>Contact Joule Dynamics support</a>}</div></section></div>}
    </>
  );
}
