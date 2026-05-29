# Repository Migration Checklist

This project has been prepared for a new portfolio repo:

- New repo name: `GlobeSense`
- New GitHub Pages path: `/GlobeSense/`
- New Pages URL: `https://griffin-hall.github.io/GlobeSense/`

## What Was Updated In Code

- `packages/client/vite.config.ts` base path now uses `/GlobeSense/`
- `packages/client/src/routes.tsx` router basename now uses `/GlobeSense`
- `.github/workflows/deploy-pages.yml` deploys from `master`
- `.github/workflows/deploy-pages.yml` supports repo variable `VITE_API_URL`
- OpenRouter referer headers now point at the new Pages URL

## Required Render Changes (Your Side)

1. Open Render service settings for the backend API.
2. Point the service repository to `Griffin-Hall/GlobeSense` (or create a new Web Service from this repo).
3. Confirm service settings:
   - Root directory: repository root (leave empty)
   - Build command: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter shared build && corepack pnpm --filter server build`
   - Start command: `corepack pnpm --filter server start`
4. Confirm/refresh environment variables:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://griffin-hall.github.io`
   - `LLM_API_KEY` (optional)
   - `LLM_BASE_URL`, `LLM_MODEL` (optional)
5. Redeploy the service.

## Optional GitHub Variable

If your Render backend URL changes, set this repo variable in GitHub:

- `VITE_API_URL=https://<your-render-service>.onrender.com`

If not set, the workflow falls back to:

- `https://webproject-ai.onrender.com`
