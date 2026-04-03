# ProposAI

AI-powered proposal generator for agencies, consultants, and freelancers.
**Positioning:** "Close More Deals With Proposals That Learn What Works."

## Architecture

### Stack
- **Frontend:** React + Vite (artifact: `proposai`, preview path: `/`)
- **Backend:** Express 5 API server (artifact: `api-server`)
- **Database:** Replit built-in PostgreSQL via Drizzle ORM
- **Auth:** Clerk (proxy at `/__clerk`)
- **AI:** Replit AI Integrations → OpenAI gpt-5.2 (no user API key needed)

### Monorepo Structure
```
lib/
  api-spec/openapi.yaml          — OpenAPI spec (source of truth)
  api-client-react/              — Generated React hooks (via Orval)
  api-zod/                       — Generated Zod schemas (via Orval)
  db/src/schema/proposals.ts     — Drizzle ORM schema
  integrations-openai-ai-server/ — OpenAI client wrapper
artifacts/
  api-server/                    — Express 5 backend
  proposai/                      — React+Vite frontend
```

### Database Schema
**proposals** table:
- id, user_id, client_name, client_email, project_title, industry
- project_description, budget, timeline, status (draft/sent/accepted/declined)
- AI sections: executive_summary, understanding, approach, timeline_plan, investment, why_us, next_steps
- created_at, updated_at

### API Routes (prefix: /api)
- `GET /healthz` — health check
- `GET /proposals` — list proposals (auth required, filterable by status)
- `POST /proposals` — create proposal
- `GET /proposals/:id` — get proposal
- `PUT /proposals/:id` — update proposal
- `DELETE /proposals/:id` — delete proposal
- `POST /proposals/:id/generate` — AI generate sections (SSE streaming)
- `POST /proposals/:id/duplicate` — duplicate proposal
- `PATCH /proposals/:id/status` — update status
- `GET /dashboard/stats` — win rate + counts
- `GET /dashboard/recent` — recent proposals feed

### Frontend Pages
- `/` — Public landing page (redirects signed-in users to /dashboard)
- `/sign-in` — Clerk sign-in (path routing)
- `/sign-up` — Clerk sign-up (path routing)
- `/dashboard` — Stats + recent proposals (auth required)
- `/proposals` — Full proposal list with filter/search (auth required)
- `/proposals/new` — Multi-step proposal creation form (auth required)
- `/proposals/:id` — Proposal editor with AI generation (auth required)
- `/proposals/:id/preview` — Print-friendly proposal preview (auth required)

### Pricing Tiers
- **Free:** 3 proposals/month
- **Starter:** ₹999/mo — 20 proposals/month
- **Growth:** ₹1999/mo — Unlimited proposals + analytics

## Key Environment Variables
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth
- `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI via Replit AI
- `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — Replit PostgreSQL

## Development Notes
- After OpenAPI spec changes: run `pnpm --filter @workspace/api-spec run codegen`
- After DB schema changes: run `pnpm --filter @workspace/db run push`
- Express 5 convention: async handlers return `Promise<void>`, early returns use `res.status().json(); return;`
- Clerk proxy path is `/__clerk`; `clerkMiddleware()` mounts AFTER the proxy in app.ts
- AI generation endpoint streams SSE: `data: {"content": "..."}` events, ends with `data: [DONE]`
- SEO: landing page has title, meta description, OG tags, Twitter Card, JSON-LD SoftwareApplication schema
- No emojis anywhere in the UI (user requirement)
