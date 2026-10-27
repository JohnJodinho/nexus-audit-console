import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { CrawlDetailPage } from './pages/CrawlDetailPage';
import { CrawlsPage } from './pages/CrawlsPage';
import { LoginPage } from './pages/LoginPage';
import { NewCrawlPage } from './pages/NewCrawlPage';
import { PagesPage } from './pages/PagesPage';
import { FindingsPage } from './pages/FindingsPage';
import { GraphPage } from './pages/GraphPage';
import { OperationsPage } from './pages/OperationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CrawlWorkspaceLayout } from './layouts/CrawlWorkspaceLayout';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/crawls" replace />} />
          <Route path="/crawls">
            <Route index element={<CrawlsPage />} />
            <Route path="new" element={<NewCrawlPage />} />
            <Route path=":crawlId" element={<CrawlWorkspaceLayout />}>
              <Route index element={<CrawlDetailPage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="findings" element={<FindingsPage />} />
              <Route path="graph" element={<GraphPage />} />
              <Route path="operations" element={<OperationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
