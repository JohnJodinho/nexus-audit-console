import { LoaderCircle } from 'lucide-react';

export type CrawlAction = 'pause' | 'resume' | 'cancel' | 'retry-failed' | 'consolidate';

export function ActionButton({ label, name, active, onClick }: { label: string; name: Exclude<CrawlAction, 'cancel'>; active: string; onClick: (name: CrawlAction) => void }) {
  return <button className="button button-quiet" disabled={active !== ''} onClick={() => onClick(name)}>{active === name ? <LoaderCircle className="spin" size={14} /> : null}{active === name ? 'Working…' : label}</button>;
}
