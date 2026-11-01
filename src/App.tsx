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
import { InspectionPage } from './pages/InspectionPage';
import { UrlRulesPreviewPage } from './pages/UrlRulesPreviewPage';
import { PageContentPage } from './pages/PageContentPage';
import { PageDetailPage } from './pages/PageDetailPage';
import { ExportsPage } from './pages/ExportsPage';

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
              <Route path="paths" element={<InspectionPage kind="paths" />} />
              <Route path="contacts" element={<InspectionPage kind="contacts" />} />
              <Route path="search" element={<InspectionPage kind="search" />} />
              <Route path="statistics" element={<InspectionPage kind="statistics" />} />
              <Route path="failures" element={<InspectionPage kind="failures" />} />
              <Route path="artifacts" element={<InspectionPage kind="artifacts" />} />
              <Route path="exports" element={<ExportsPage />} />
              <Route path="url-rules" element={<UrlRulesPreviewPage />} />
              <Route path="pages/:pageId" element={<PageDetailPage />} />
              <Route path="pages/:pageId/content" element={<PageContentPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
