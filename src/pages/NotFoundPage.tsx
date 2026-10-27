import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="state-box state-error route-not-found">
      <div>
        <strong>Page not found</strong>
        <p>This route is not part of the Nexus Audit Console.</p>
        <Link className="button button-quiet" to="/crawls">Return to crawls</Link>
      </div>
    </div>
  );
}
