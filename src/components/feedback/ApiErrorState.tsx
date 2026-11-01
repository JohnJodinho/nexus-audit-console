import { AlertTriangle } from 'lucide-react';
import { ApiError } from '../../api/client';

export function ApiErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error instanceof ApiError ? error : null;
  const message = apiError?.userMessage ?? (error instanceof Error ? error.message : 'The request failed.');
  return <div className="state-box state-error" role="alert"><AlertTriangle size={20} /><div><strong>{apiError?.status === 401 ? 'Authentication required' : 'Request failed'}</strong><p>{message}</p>{apiError?.requestId && <small className="mono-text">Request ID: {apiError.requestId}</small>}{onRetry && <button className="button button-quiet" onClick={onRetry}>Retry</button>}</div></div>;
}
