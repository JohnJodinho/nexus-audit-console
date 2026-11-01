const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? '15000');

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required. Add it to .env.local or the Vercel project environment variables.');
}

export const appConfig = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  apiTimeoutMs: Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 15000,
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL?.trim() || `${apiBaseUrl.replace(/\/$/, '')}/docs`,
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL?.trim(),
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL?.trim(),
} as const;
