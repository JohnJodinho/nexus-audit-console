const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required. Add it to .env.local or the Vercel project environment variables.');
}

export const appConfig = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL?.trim() || `${apiBaseUrl.replace(/\/$/, '')}/docs`,
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL?.trim(),
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL?.trim(),
} as const;
