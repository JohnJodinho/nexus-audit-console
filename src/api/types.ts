export type CrawlStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'draining'
  | 'consolidating'
  | 'finished'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | string;

export type CrawlListItem = {
  id: string;
  target_url: string;
  target_domain?: string | null;
  status: CrawlStatus;
  created_at?: string | null;
  updated_at?: string | null;
  pages_processed?: number | null;
  pages_failed?: number | null;
  findings_count?: number | null;
};

export type CrawlListResponse = {
  total: number;
  limit: number;
  offset: number;
  crawls: CrawlListItem[];
};

export type CrawlCreateConfig = {
  max_pages?: number;
  max_depth?: number;
  worker_count?: number;
  categories?: string[] | null;
};

export type CrawlCreateRequest = {
  url: string;
  crawl_id?: string;
  config?: CrawlCreateConfig;
};

export type CrawlCreateResponse = {
  id?: string;
  crawl_id?: string;
  status?: CrawlStatus;
  message?: string;
  duplicate?: boolean;
  details?: Record<string, unknown> | null;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type ApiEvent = {
  id?: string;
  event: string;
  data: {
    crawl_id?: string | null;
    payload?: Record<string, unknown>;
  };
};

export type PaginatedResponse<T> = {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    [key: string]: T[] | number;
};

export type CrawlPage = {
    id: number;
    url?: string;
    status_code?: number;
    findings_count?: number;
    title?: string;
};

export type Finding = {
    id: string;
    category?: string;
    severity?: string;
    canvas_zone?: string;
    status?: string;
    title?: string;
    description?: string;
    evidence?: string;
    remediation?: string | null;
    page_url?: string;
};

export type Summary = Record<string, unknown>;
export type Telemetry = Record<string, unknown>;
export type DlqResponse = Record<string, unknown>;
export type GraphResponse = { nodes?: Array<Record<string, unknown>>; edges?: Array<Record<string, unknown>> };
