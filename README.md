# Nexus Audit Console

![Nexus Audit Console](https://img.shields.io/badge/Joule%20Dynamics-Nexus%20Audit%20Console-e45bdd)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

Nexus Audit Console is the operator-facing web application for monitoring website crawls, reviewing audit findings, inspecting page coverage, and viewing crawl operations data. It is built for Joule Dynamics and communicates with the Nexus Query API over authenticated REST and SSE connections.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Application structure](#application-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available scripts](#available-scripts)
- [Authentication and security](#authentication-and-security)
- [Deployment](#deployment)
- [API integration](#api-integration)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- Memory-only operator authentication.
- Protected routes for crawl operations.
- Crawl inventory with server-side filtering and pagination.
- Create, pause, resume, cancel, retry, consolidate, export, and delete crawl workflows.
- Pages view with pagination and “pages with findings” filtering.
- Findings view with server-side category, severity, canvas-zone, and review-status filters.
- Review-status updates backed by the API.
- Authenticated SSE invalidation with reconnect backoff, cursor replay, and resynchronisation handling.
- Crawl graph response inspection.
- Operations telemetry and dead-letter queue inspection.
- JSON and Markdown report exports.
- Responsive dark/light operator console.
- Vercel SPA rewrites for deep links.

## Technology

- React 19
- TypeScript
- Vite
- React Router
- Lucide React
- ESLint
- Vercel

The project intentionally uses the existing dependency set and does not persist authentication tokens in browser storage.

## Application structure

```text
src/
├── api/          REST client, API types, and SSE transport
├── components/   Reusable brand, crawl, and feedback components
├── data/         Status labels and domain display helpers
├── layouts/      Protected shell, sidebar, topbar, and crawl workspace
├── lib/          Formatting and route helpers
├── pages/        Route-level screens
├── auth.tsx      Memory-only authentication context
├── config.ts     Validated Vite environment configuration
└── styles.css    Design tokens and application styles
public/           Static public assets
misc/             Local planning/deployment notes; ignored by Git
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Access to a running Nexus Query API for authenticated workflows

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/JohnJodinho/nexus-audit-console.git
cd nexus-audit-console
npm install
```

Create a local environment file:

```bash
Copy-Item .env.example .env.local
```

Update `.env.local` with the API URLs used by your environment, then start Vite:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment configuration

All browser-visible configuration is supplied through Vite environment variables. Variables must use the `VITE_` prefix to be available to frontend code. Never put passwords, API tokens, signing secrets, or private credentials in these variables.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL for the Nexus Query API, without a trailing slash. |
| `VITE_API_DOCS_URL` | No | API documentation URL. Defaults to `${VITE_API_BASE_URL}/docs`. |
| `VITE_PUBLIC_SITE_URL` | No | Public Joule Dynamics website URL used by the navigation link. |
| `VITE_SUPPORT_EMAIL` | No | Support email used by the help dialog. |

`.env` and `.env.local` are ignored by Git. `.env.example` contains safe configuration examples and is tracked. Vercel variables must be configured separately for Development, Preview, and Production environments as appropriate.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript project builds and create the production bundle. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run lint` | Run ESLint with zero warnings allowed. |
| `npm run validate` | Run lint and the production build. |

## Authentication and security

- Login is performed by the API at `/api/auth/login`.
- The bearer token is held only in React memory.
- The token is not written to `localStorage`, `sessionStorage`, URLs, cookies, or source files.
- Protected API requests include the bearer token through the central API client.
- A `401` response signs the operator out and returns the app to `/login`.
- API-provided content is rendered as text or escaped JSON; API HTML is not injected into the DOM.
- The frontend must contain only public build configuration. Secrets belong on the backend.

## Deployment

The application is configured for Vercel with [vercel.json](./vercel.json), which rewrites SPA deep links to `index.html`.

Recommended production setup:

1. Create a separate Vercel project for this repository.
2. Set the framework preset to Vite or allow Vercel to detect it.
3. Configure the `VITE_*` variables in the Vercel project.
4. Add the production domain `console.jouledynamics.me`.
5. Configure the DNS record requested by Vercel at Namecheap.
6. Confirm the API allows the production console origin through CORS.
7. Verify HTTPS, login, protected requests, SSE, deep links, exports, and logout.

The detailed Namecheap and Vercel procedure is intentionally stored in [misc/deployment-namecheap-vercel.md](./misc/deployment-namecheap-vercel.md). The entire `misc/` directory is ignored and must not be committed.

## API integration

The central API implementation is in [src/api/client.ts](./src/api/client.ts). It normalises API and FastAPI validation errors and exposes the application operations. [src/api/sse.ts](./src/api/sse.ts) uses `fetch()` instead of native `EventSource` because the event stream requires a bearer header.

Before production release, confirm the frontend models against the live OpenAPI schema. The frontend does not manufacture operational metrics when the API does not return them.

## Validation

Run the release validation command before opening a pull request or deploying:

```bash
npm run validate
```

This runs ESLint and the TypeScript/Vite production build. The project currently has no component test runner; browser smoke checks and live API integration checks should be run as part of release acceptance.

## Troubleshooting

### The app stops at startup with a missing environment error

Set `VITE_API_BASE_URL` in `.env.local` for local work or in the relevant Vercel environment. Restart Vite after changing environment files.

### API requests fail in the browser

Check the API URL, backend availability, authentication credentials, and backend CORS configuration. Browser CORS cannot be repaired from the frontend.

### Refreshing a nested route returns 404 in production

Confirm the Vercel project is using the committed `vercel.json` rewrite configuration and redeploy after changing it.

### SSE remains offline

Confirm that the API supports authenticated `/api/events` requests, allows the production origin, and returns `text/event-stream` responses.

## Contributing

1. Create a focused branch.
2. Keep changes modular and route ownership explicit.
3. Do not commit `.env`, `.env.local`, credentials, generated `dist/`, or `misc/`.
4. Run `npm run validate`.
5. Describe API contract assumptions and manual verification in the pull request.

## License

This project is maintained for Joule Dynamics. Licensing and redistribution terms should be confirmed with the project owner before external distribution.
