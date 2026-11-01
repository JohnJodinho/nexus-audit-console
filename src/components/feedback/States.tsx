import { Ban, CircleOff, Clock3, LoaderCircle, ShieldAlert } from 'lucide-react';

export function LoadingState() {
  return <div className="state-box"><LoaderCircle className="spin" size={21} /><span>Loading authoritative API data…</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="state-box state-error">
      <ShieldAlert size={20} />
      <div>
        <strong>Could not load this view</strong>
        <p>{message}</p>
        <button className="button button-quiet" onClick={onRetry}>Retry</button>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'Nothing returned', message = 'The API returned no records.' }: { title?: string; message?: string }) {
  return <div className="state-box"><CircleOff size={20} /><div><strong>{title}</strong><p>{message}</p></div></div>;
}

export function UnavailableState({ message = 'This data is not available for the current crawl.' }: { message?: string }) {
  return <div className="state-box"><Ban size={20} /><div><strong>Unavailable</strong><p>{message}</p></div></div>;
}

export function CancelledState() {
  return <div className="state-box"><Ban size={20} /><div><strong>Cancelled</strong><p>This operation was cancelled before completion.</p></div></div>;
}

export function ExpiredState() {
  return <div className="state-box"><Clock3 size={20} /><div><strong>Expired</strong><p>This result is no longer available. Start a new operation.</p></div></div>;
}
