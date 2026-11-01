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
  started_at?: string | null;
  finished_at?: string | null;
  updated_at?: string | null;
  progress?: number | null;
  pages_discovered?: number;
  pages_total?: number;
  max_pages?: number;
  next_recommended_action?: 'wait' | 'retrieve' | 'none' | string | null;
  pages_processed?: number;
  pages_failed?: number;
  findings_count?: number;
};

export type CrawlResponse = CrawlListItem & {
  worker_count?: number;
  pages_discovered?: number;
  config?: CrawlCreateConfig | null;
  consolidated_report?: Record<string, unknown> | null;
  error?: string | null;
};

export type CrawlStatusResponse = {
  crawl_id: string;
  status: CrawlStatus;
  pages_discovered?: number;
  pages_processed?: number;
  pages_failed?: number;
  findings_count?: number;
  progress: number;
  next_recommended_action: 'wait' | 'retrieve' | 'none' | string;
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
  include_patterns?: string[];
  exclude_patterns?: string[];
  exclude_resource_types?: string[];
};

export type CrawlCreateRequest = {
  url: string;
  crawl_id?: string;
  config?: CrawlCreateConfig;
};

export type CrawlCreateResponse = {
  crawl_id: string;
  status: CrawlStatus;
  message: string;
  is_duplicate?: boolean;
  existing_crawl_id?: string | null;
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
export type CrawlSummary = {
  crawl_id: string;
  target_url: string;
  status: CrawlStatus;
  pages_total: number;
  pages_with_issues: number;
  finding_counts_by_category: Record<string, number>;
  finding_counts_by_severity: Record<string, number>;
  top_findings: Finding[];
};
export type Telemetry = {
  crawl_id: string;
  total_dropped: number;
  dropped_reasons: Array<Record<string, unknown>>;
  recent_events?: Array<Record<string, unknown>>;
};
export type DlqResponse = {
  crawl_id: string;
  total_failed_tasks: number;
  items: Array<Record<string, unknown>>;
};
export type GraphResponse = {
  crawl_id: string;
  total_nodes: number;
  total_edges: number;
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
};
