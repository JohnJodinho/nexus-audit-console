import type {
  CrawlCreateRequest,
  CrawlCreateResponse,
  CrawlListResponse,
  LoginResponse,
  CrawlPage,
  Finding,
  PaginatedResponse,
  Summary,
  Telemetry,
  DlqResponse,
  GraphResponse,
} from './types';
import { appConfig } from '../config';

const API_BASE_URL = appConfig.apiBaseUrl;

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
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

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
  onUnauthorized?: () => void,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('The API could not be reached. Check the connection and try again.', 0);
  }

  const body = await parseResponse(response);
  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    const detail = body && typeof body === 'object' && 'detail' in body ? body.detail : body;
    const message = getDetailMessage(detail) ?? `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status, detail);
  }
  return body as T;
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

export function refreshTokenSafe(token: string, onUnauthorized?: () => void) {
  return request<unknown>('/api/crawls?limit=1&offset=0', {}, token, onUnauthorized);
}

export function getSummary(token: string, crawlId: string, onUnauthorized?: () => void) {
  return request<Summary>(`/api/crawls/${encodeURIComponent(crawlId)}/summary`, {}, token, onUnauthorized);
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
  return request<{ content?: string }>(`/api/crawls/${encodeURIComponent(crawlId)}/export?format=${format}`, {}, token, onUnauthorized);
}

export { API_BASE_URL };
