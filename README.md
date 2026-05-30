# GlobeSense

GlobeSense is an AI-powered travel discovery app that turns natural language trip ideas into ranked destination recommendations. It combines intent extraction, weather, budget, safety, and vibe scoring to help users find places that match how they actually want to travel.

## Highlights

- Natural language destination search with hosted LLM, local Ollama, and keyword fallback modes.
- Ranked match results across weather, budget, safety, and trip style fit, with match reasons and live verification links.
- Destination detail pages with climate charts, cost breakdowns, safety context, and AI city chat.
- Multi-destination comparison flow with an AI comparison assistant.
- Server-side `LLM_API_KEY` support with optional bring-your-own-key overrides for OpenAI, Anthropic, Gemini, Kimi, and OpenRouter.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query.
- Backend: Express, TypeScript, Prisma, Zod, Pino.
- Database: PostgreSQL with pgvector.
- AI: OpenAI-compatible hosted APIs, local Ollama, and deterministic fallback extraction.
- Monorepo: pnpm workspaces.

## Architecture

```text
packages/client   React app and user-facing travel experience
packages/server   Express API, AI orchestration, scoring, and Prisma access
packages/shared   Shared TypeScript types and scoring constants
```

Search flow:

```text
User query -> /api/search -> intent extraction -> destination scoring -> ranked results
```

## Local Development

```bash
corepack pnpm install
docker-compose up -d
corepack pnpm --filter @globesense/server db:generate
corepack pnpm --filter @globesense/server db:seed
corepack pnpm dev
```

Client: `http://localhost:5173`

API: `http://localhost:3001`

## Verification

```bash
corepack pnpm -r typecheck
corepack pnpm build
corepack pnpm eval:ai
```

## Deployment

The client uses `VITE_BASE_PATH` during the GitHub Pages build, so it can deploy under the current repository path and will automatically move to `/GlobeSense/` after the repository is renamed. The backend is designed for Render or another Node host with `DATABASE_URL`, `CLIENT_URL`, and optional `LLM_API_KEY` environment variables.
