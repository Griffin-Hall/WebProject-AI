# Voyage Matcher - AI Coding Agent Guide

## Project Overview

Voyage Matcher (codename: GlobeSense) is an AI-powered travel discovery and matching platform. It helps users find their ideal travel destinations by understanding natural language queries and matching them against a curated database of destinations using AI-driven intent extraction and multi-dimensional scoring.

### Key Features
- **Natural Language Search**: Users can describe their ideal vacation in plain English (e.g., "cheap warm beach vacation in July")
- **AI Intent Extraction**: Uses local Ollama LLM (with keyword fallback) to extract structured preferences from queries
- **Multi-dimensional Scoring**: Matches destinations based on weather, budget, safety, and vibe preferences
- **Interactive Destination Pages**: Rich destination details with weather charts, cost breakdowns, and safety information
- **AI City Assistant**: Chat interface for destination-specific questions (simulated responses)
- **User Preferences**: Saved matches and personal preference management

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL with pgvector extension |
| AI/LLM | Ollama (local), OpenAI API (optional fallback) |
| Package Manager | pnpm with workspaces |
| Deployment | GitHub Pages (frontend), Render.com (backend) |

## Project Structure

This is a monorepo managed with pnpm workspaces:

```
WebProject-AI/
├── packages/
│   ├── client/          # React frontend (Vite)
│   ├── server/          # Express backend API
│   └── shared/          # Shared types and constants
├── package.json         # Root package.json with workspace scripts
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── tsconfig.base.json   # Shared TypeScript configuration
└── docker-compose.yml   # PostgreSQL with pgvector for local development
```

### Package Details

#### `@voyage-matcher/client`
- **Entry**: `src/main.tsx`
- **Build Output**: `dist/` (static files)
- **Dev Server**: http://localhost:5173
- **Key Dependencies**: React Router, TanStack Query, Three.js (globe visualization), Recharts

#### `@voyage-matcher/server`
- **Entry**: `src/index.ts`
- **Build Output**: `dist/` (JavaScript files)
- **Dev Server**: http://localhost:3001
- **Key Dependencies**: Express, Prisma, Zod, Pino (logging), OpenAI SDK

#### `@voyage-matcher/shared`
- **Purpose**: Shared TypeScript types, interfaces, and constants
- **Consumed by**: Both client and server via workspace dependency
- **Key Exports**: Destination types, search types, scoring constants, vibe definitions

## Environment Configuration

### Required Environment Variables

Create `.env` files based on `.env.example` in both `packages/server/` and `packages/client/`.

**Server (`packages/server/.env`)**:
```env
# Database (PostgreSQL with pgvector)
DATABASE_URL=postgresql://voyage:voyage_dev@localhost:5432/voyage_matcher

# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Ollama (Local LLM)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3-coder:30b
OLLAMA_TIMEOUT_MS=30000
OLLAMA_MAX_RETRIES=2

# Optional: External LLM providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**Client (`packages/client/.env`)**:
```env
VITE_API_URL=http://localhost:3001
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=
```

## Build and Development Commands

### Root Level Scripts

```bash
# Install dependencies for all packages
pnpm install

# Start both client and server in development mode
pnpm dev

# Build all packages (order: shared → server → client)
pnpm build

# Run TypeScript type checking across all packages
pnpm typecheck

# Run linting across all packages
pnpm lint

# Format code with Prettier
pnpm format
```

### Package-Specific Scripts

**Client**:
```bash
cd packages/client
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript check only
```

**Server**:
```bash
cd packages/server
pnpm dev          # Start with tsx watch
pnpm build        # Compile TypeScript + generate Prisma client
pnpm start        # Run compiled JavaScript
pnpm db:migrate   # Run Prisma migrations
pnpm db:generate  # Generate Prisma client
pnpm db:seed      # Seed database with destination data
pnpm db:push      # Push schema changes (dev only)
pnpm test:ollama  # Test Ollama connection
```

**Shared**:
```bash
cd packages/shared
pnpm build        # Compile TypeScript
pnpm typecheck    # TypeScript check
```

## Database Setup

### Local Development with Docker

```bash
# Start PostgreSQL with pgvector
docker-compose up -d

# The database will be available at localhost:5432
# Default credentials: voyage / voyage_dev
```

### Database Schema

The Prisma schema defines the following main entities:
- `Destination`: Core destination data (city, country, coordinates, description)
- `DestinationWeather`: Monthly weather data per destination
- `DestinationCosts`: Daily budget estimates (low/mid/high)
- `DestinationSafety`: Safety scores and advisory levels
- `DestinationTag`: Categorical tags for destinations
- `DestinationEmbedding`: Vector embeddings for AI similarity search
- `User`: User profiles (via Clerk authentication)
- `SavedMatch`: User's saved destination matches
- `UserPreferences`: User's preference settings
- `SearchHistory`: Search query history with extracted intent

### Seeding Data

```bash
cd packages/server
pnpm db:seed
```

This populates the database with destination data from `prisma/seed-data/`.

## Code Organization

### Server Architecture

```
src/
├── app.ts                 # Express app factory
├── index.ts               # Server entry point
├── config/
│   ├── database.ts        # Prisma client setup
│   └── env.ts             # Environment validation (Zod)
├── controllers/           # Route handlers
├── routes/                # Route definitions
├── services/              # Business logic
├── middleware/            # Express middleware
├── validators/            # Request validation (Zod schemas)
└── utils/                 # Utilities (logger, errors, prompts)
```

**Key Services**:
- `ollama.client.ts`: Client for local Ollama LLM with retry/fallback logic
- `intent.service.ts`: Extracts structured intent from natural language queries
- `matching.service.ts`: Scores destinations against extracted intent
- `search.service.ts`: Orchestrates search pipeline

### Client Architecture

```
src/
├── App.tsx                # Root component with QueryClient
├── routes.tsx             # React Router configuration
├── main.tsx               # Entry point
├── components/
│   ├── destination/       # Destination-related components
│   ├── hero/              # Hero section with animations
│   ├── home/              # Home page sections
│   ├── layout/            # Layout components (Header, Footer)
│   ├── results/           # Search results components
│   ├── search/            # Search bar and related
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and constants
└── pages/                 # Page components
```

## Code Style Guidelines

### TypeScript

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled
- All imports must use `.js` extension (Node16/ESM requirement)

### Formatting

Prettier configuration (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Naming Conventions

- **Files**: kebab-case for utilities, PascalCase for components
- **Components**: PascalCase (e.g., `HeroSection.tsx`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE or camelCase
- **Types/Interfaces**: PascalCase with descriptive names
- **Database Models**: PascalCase (Prisma convention)

### Import Patterns

```typescript
// External dependencies first
import express from 'express';
import { z } from 'zod';

// Internal workspace packages
import type { Destination } from '@voyage-matcher/shared';

// Internal modules (use .js extension for ESM)
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
```

## Testing

### Manual Testing Checklist

**Ollama Integration**:
1. Start Ollama locally (`ollama run qwen3-coder:30b`)
2. Submit search query via UI
3. Check server logs for intent extraction
4. Stop Ollama and verify fallback keyword extraction works

**API Endpoints**:
```bash
# Health check
curl http://localhost:3001/api/health

# Ollama status
curl http://localhost:3001/api/health/ollama

# Search
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "warm beach vacation"}'

# List destinations
curl http://localhost:3001/api/destinations
```

## Deployment

### Frontend (GitHub Pages)

The client is deployed to GitHub Pages at:
- **URL**: https://griffin-hall.github.io/WebProject-AI/

The build is triggered by GitHub Actions workflow (see `.github/workflows/`).

### Backend (Render.com)

The server is deployed to Render.com at:
- **URL**: https://webproject-ai.onrender.com

**Important**: The Render deployment does NOT have access to your local Ollama instance. It uses keyword-based fallback extraction.

### Local Full-Stack Development

To use your local Ollama instance:

```bash
# Terminal 1: Start database
docker-compose up -d

# Terminal 2: Start server
cd packages/server
pnpm dev

# Terminal 3: Start client
cd packages/client
pnpm dev

# Access at http://localhost:5173
```

## Security Considerations

### Environment Variables
- Never commit `.env` files
- All environment variables are validated at startup using Zod
- No hardcoded secrets in source code

### API Security
- Rate limiting enabled (`express-rate-limit`)
- CORS configured to allow specific origins only
- Input validation using Zod on all routes

### Authentication
- User authentication is handled via Clerk (webhook integration in `webhooks.controller.ts`)
- Clerk webhooks verify signatures using `CLERK_WEBHOOK_SECRET`

## Troubleshooting

### Common Issues

**Ollama Connection Failed**:
```
Error: Ollama is not available at http://127.0.0.1:11434
```
Solution: Start Ollama (`ollama serve`) or the system will fall back to keyword extraction.

**Database Connection Error**:
```
Error: Can't reach database server at `localhost:5432`
```
Solution: Start Docker container (`docker-compose up -d`)

**Prisma Client Not Found**:
```
Error: Cannot find module '@prisma/client'
```
Solution: Run `pnpm db:generate` in the server package.

**Module Not Found (ESM)**:
Ensure all local imports use `.js` extension, even for TypeScript files.

## AI Architecture Notes

### Intent Extraction Flow

1. User submits natural language query
2. System checks if Ollama is available
3. If available: Sends query to Ollama LLM with structured prompt
4. If unavailable/times out: Falls back to keyword-based extraction
5. Returns `ExtractedIntent` object with:
   - `budget`: 'budget' | 'mid' | 'luxury' | null
   - `temp_pref`: 'cold' | 'mild' | 'warm' | 'hot' | null
   - `month`: number (1-12) | null
   - `trip_styles`: string[]
   - `safety_priority`: 'low' | 'medium' | 'high'

### Scoring Algorithm

Destinations are scored across multiple dimensions:
- **Weather**: Matches preferred temperature and month
- **Budget**: Compares daily costs against budget level
- **Safety**: Weights safety score by user's priority
- **Vibe**: Matches tags against trip styles

Composite score is a weighted average (weights defined in `packages/shared/src/constants/scoring.ts`).

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Ollama API**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
