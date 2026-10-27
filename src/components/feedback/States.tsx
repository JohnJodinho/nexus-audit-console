import { LoaderCircle, ShieldAlert } from 'lucide-react';

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
