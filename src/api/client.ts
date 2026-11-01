import type {
  CrawlCreateRequest,
  CrawlCreateResponse,
  CrawlListResponse,
  CrawlResponse,
  CrawlStatusResponse,
  LoginResponse,
  CrawlPage,
  Finding,
  PaginatedResponse,
  CrawlSummary,
  Telemetry,
  DlqResponse,
  GraphResponse,
  ExportRequest,
  JobResponse,
  ExportStatusResponse,
  PreviewStatusResponse,
  PageContentResponse,
  JsonObject,
} from './types';
import { appConfig } from '../config';

const API_BASE_URL = appConfig.apiBaseUrl;

function messageForStatus(status: number, fallback: string) {
  const messages: Record<number, string> = {
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'The request conflicts with the current server state.',
    413: 'The request is too large.',
    422: fallback,
    429: 'Too many requests. Wait briefly and try again.',
    503: 'The API is temporarily unavailable. Try again shortly.',
  };
  return messages[status] ?? fallback;
}

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  code?: string;
  field?: string;
  pattern?: string;
  index?: number;
  requestId?: string;
  userMessage: string;

  constructor(message: string, status: number, detail?: unknown, metadata: Partial<Pick<ApiError, 'code' | 'field' | 'pattern' | 'index' | 'requestId'>> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.userMessage = messageForStatus(status, message);
    Object.assign(this, metadata);
  }

}

function getDetailMessage(detail: unknown): string | undefined {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : ''))
      .filter(Boolean);
    return messages.length > 0 ? messages.join('. ') : undefined;
  }
  if (detail && typeof detail === 'object' && 'message' in detail) return String(detail.message);
  return undefined;
}

function getErrorMetadata(detail: unknown) {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return {};
  const record = detail as Record<string, unknown>;
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    field: typeof record.field === 'string' ? record.field : undefined,
    pattern: typeof record.pattern === 'string' ? record.pattern : undefined,
    index: typeof record.index === 'number' ? record.index : undefined,
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function createRequestSignal(signal: AbortSignal | undefined) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), appConfig.apiTimeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    },
  };
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
  onUnauthorized?: () => void,
): Promise<T> {
  let response: Response;
  const requestSignal = createRequestSignal(options.signal ?? undefined);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: requestSignal.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The API request was cancelled or timed out.', 0);
    }
    throw new ApiError('The API could not be reached. Check the connection and try again.', 0);
  } finally {
    requestSignal.cleanup();
  }

  const body = await parseResponse(response);
  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    const detail = body && typeof body === 'object' && 'detail' in body ? body.detail : body;
    const message = getDetailMessage(detail) ?? `Request failed with status ${response.status}.`;
    const requestId = response.headers.get('x-request-id') ?? response.headers.get('x-correlation-id') ?? undefined;
    throw new ApiError(message, response.status, detail, { ...getErrorMetadata(detail), requestId });
  }
  return body as T;
}

export async function requestBlob(
  path: string,
  options: RequestInit = {},
  token?: string,
  onUnauthorized?: () => void,
): Promise<{ blob: Blob; contentType: string; contentDisposition: string | null }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await parseResponse(response);
    if (response.status === 401) onUnauthorized?.();
    const detail = body && typeof body === 'object' && 'detail' in body ? body.detail : body;
    throw new ApiError(getDetailMessage(detail) ?? `Request failed with status ${response.status}.`, response.status, detail, {
      ...getErrorMetadata(detail),
      requestId: response.headers.get('x-request-id') ?? response.headers.get('x-correlation-id') ?? undefined,
    });
  }
  return {
    blob: await response.blob(),
    contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    contentDisposition: response.headers.get('content-disposition'),
  };
}

export function login(username: string, password: string) {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function listCrawls(
  token: string,
  params: { domain?: string; status?: string; limit: number; offset: number },
  onUnauthorized?: () => void,
) {
  const query = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.domain) query.set('domain', params.domain);
  if (params.status) query.set('status', params.status);
  return request<CrawlListResponse>(`/api/crawls?${query}`, {}, token, onUnauthorized);
}

export function createCrawl(token: string, payload: CrawlCreateRequest, onUnauthorized?: () => void) {
  return request<CrawlCreateResponse>('/api/crawls', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token, onUnauthorized);
}

export function getCrawl(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<CrawlResponse>(`/api/crawls/${encodeURIComponent(crawlId)}`, {}, token, onUnauthorized);
}

export function getCrawlStatus(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<CrawlStatusResponse>(`/api/crawls/${encodeURIComponent(crawlId)}/status`, {}, token, onUnauthorized);
}

export function refreshTokenSafe(token: string, onUnauthorized?: () => void) {
  return request<unknown>('/api/crawls?limit=1&offset=0', {}, token, onUnauthorized);
}

export function getSummary(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<CrawlSummary>(`/api/crawls/${encodeURIComponent(crawlId)}/summary`, {}, token, onUnauthorized);
}

export function listPages(token: string, crawlId: string, page: number, perPage: number, hasFindings: boolean, onUnauthorized?: () => void) {
  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (hasFindings) query.set('has_findings', 'true');
  return request<PaginatedResponse<CrawlPage>>(`/api/crawls/${encodeURIComponent(crawlId)}/pages?${query}`, {}, token, onUnauthorized);
}

export function listFindings(token: string, crawlId: string, page: number, perPage: number, filters: Record<string, string>, onUnauthorized?: () => void) {
  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  return request<PaginatedResponse<Finding>>(`/api/crawls/${encodeURIComponent(crawlId)}/findings?${query}`, {}, token, onUnauthorized);
}

export function updateFindingStatus(token: string, crawlId: string, findingId: string, status: string, onUnauthorized?: () => void) {
  return request<Finding>(`/api/crawls/${encodeURIComponent(crawlId)}/findings/${encodeURIComponent(findingId)}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token, onUnauthorized);
}

export function getTelemetry(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<Telemetry>(`/api/crawls/${encodeURIComponent(crawlId)}/telemetry`, {}, token, onUnauthorized);
}

export function getDlq(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<DlqResponse>(`/api/crawls/${encodeURIComponent(crawlId)}/dlq?limit=50`, {}, token, onUnauthorized);
}

export function getGraph(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<GraphResponse>(`/api/crawls/${encodeURIComponent(crawlId)}/graph?limit=200`, {}, token, onUnauthorized);
}

export async function exportCrawl(token: string, crawlId: string, format: 'json' | 'markdown', onUnauthorized?: () => void) {
  return request<{ crawl_id: string; format: 'json' | 'markdown'; generated_at: string; content: string }>(`/api/crawls/${encodeURIComponent(crawlId)}/export?format=${format}`, {}, token, onUnauthorized);
}

function crawlPath(crawlId: string, suffix: string) {
  return `/api/crawls/${encodeURIComponent(crawlId)}${suffix}`;
}

export function getPageContent(token: string, crawlId: string, pageId: number, options: { format?: string; download?: boolean; includeMetadata?: boolean; signal?: AbortSignal } = {}, onUnauthorized?: () => void) {
  const query = new URLSearchParams();
  if (options.format) query.set('format', options.format);
  if (options.download !== undefined) query.set('download', String(options.download));
  if (options.includeMetadata !== undefined) query.set('include_metadata', String(options.includeMetadata));
  return request<PageContentResponse>(`${crawlPath(crawlId, `/pages/${pageId}/content`)}?${query}`, { signal: options.signal }, token, onUnauthorized);
}

export function downloadPageContent(token: string, crawlId: string, pageId: number, format: string, includeMetadata: boolean, onUnauthorized?: () => void) {
  const query = new URLSearchParams({ format, download: 'true', include_metadata: String(includeMetadata) });
  return requestBlob(`${crawlPath(crawlId, `/pages/${pageId}/content`)}?${query}`, {}, token, onUnauthorized);
}

export function createExport(token: string, crawlId: string, payload: ExportRequest, onUnauthorized?: () => void) {
  return request<JobResponse>(crawlPath(crawlId, '/exports'), { method: 'POST', body: JSON.stringify(payload) }, token, onUnauthorized);
}

export function getExportStatus(token: string, crawlId: string, exportId: string, onUnauthorized?: () => void) {
  return request<ExportStatusResponse>(crawlPath(crawlId, `/exports/${encodeURIComponent(exportId)}`), {}, token, onUnauthorized);
}

export function downloadExport(token: string, crawlId: string, exportId: string, onUnauthorized?: () => void) {
  return requestBlob(crawlPath(crawlId, `/exports/${encodeURIComponent(exportId)}/download`), {}, token, onUnauthorized);
}

export function cancelExport(token: string, crawlId: string, exportId: string, onUnauthorized?: () => void) {
  return request<JobResponse>(crawlPath(crawlId, `/exports/${encodeURIComponent(exportId)}/cancel`), { method: 'POST' }, token, onUnauthorized);
}

export function createExportPreview(token: string, crawlId: string, payload: ExportRequest, onUnauthorized?: () => void) {
  return request<JobResponse>(crawlPath(crawlId, '/exports/preview'), { method: 'POST', body: JSON.stringify(payload) }, token, onUnauthorized);
}

export function getExportPreviewStatus(token: string, crawlId: string, previewId: string, onUnauthorized?: () => void) {
  return request<PreviewStatusResponse>(crawlPath(crawlId, `/exports/previews/${encodeURIComponent(previewId)}`), {}, token, onUnauthorized);
}

export function cancelExportPreview(token: string, crawlId: string, previewId: string, onUnauthorized?: () => void) {
  return request<JobResponse>(crawlPath(crawlId, `/exports/previews/${encodeURIComponent(previewId)}/cancel`), { method: 'POST' }, token, onUnauthorized);
}

export function previewUrlRules(token: string, payload: JsonObject, signal?: AbortSignal, onUnauthorized?: () => void) {
  return request<unknown>('/api/url-rules/preview', { method: 'POST', body: JSON.stringify(payload), signal }, token, onUnauthorized);
}

export function getPaths(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<unknown>(crawlPath(crawlId, '/paths'), {}, token, onUnauthorized);
}

export function getContacts(token: string, crawlId: string, params: Record<string, string | number | boolean | undefined> = {}, onUnauthorized?: () => void) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
  return request<unknown>(`${crawlPath(crawlId, '/contacts')}?${query}`, {}, token, onUnauthorized);
}

export function searchCrawl(token: string, crawlId: string, queryText: string, page = 1, limit = 50, onUnauthorized?: () => void) {
  const query = new URLSearchParams({ q: queryText, page: String(page), limit: String(limit) });
  return request<unknown>(`${crawlPath(crawlId, '/search')}?${query}`, {}, token, onUnauthorized);
}

export function getPageLinks(token: string, crawlId: string, pageId: number, direction?: string, onUnauthorized?: () => void) {
  const query = direction ? `?direction=${encodeURIComponent(direction)}` : '';
  return request<unknown>(crawlPath(crawlId, `/pages/${pageId}/links${query}`), {}, token, onUnauthorized);
}

export function getCrawlEvents(token: string, crawlId: string, lastEventId?: string, onUnauthorized?: () => void) {
  return request<unknown>(crawlPath(crawlId, '/events'), { headers: lastEventId ? { 'Last-Event-ID': lastEventId } : {} }, token, onUnauthorized);
}

export function getFailures(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<unknown>(crawlPath(crawlId, '/failures'), {}, token, onUnauthorized);
}

export function getStatistics(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<unknown>(crawlPath(crawlId, '/statistics'), {}, token, onUnauthorized);
}

export function getPageMetadata(token: string, crawlId: string, pageId: number, onUnauthorized?: () => void) {
  return request<unknown>(crawlPath(crawlId, `/pages/${pageId}/metadata`), {}, token, onUnauthorized);
}

export function getArtifacts(token: string, crawlId: string, params: { type?: string; pageId?: number } = {}, onUnauthorized?: () => void) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.pageId !== undefined) query.set('page_id', String(params.pageId));
  return request<unknown>(`${crawlPath(crawlId, '/artifacts')}?${query}`, {}, token, onUnauthorized);
}

export { API_BASE_URL };
