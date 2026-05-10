# Architecture

```mermaid
flowchart LR
  User[User Browser] --> App[Next.js App Router]
  App --> Store[Zustand Store]
  Store --> Engine[Audit Engine - client]
  Engine --> Results[Results Page]
  Results --> Summarize[/api/summarize]
  Results --> Leads[/api/leads]
  Summarize --> Anthropic[Anthropic API]
  Leads --> Supabase[Supabase Postgres]
  Leads --> Resend[Resend Email]
  Supabase --> Share[Share Page /audit/share/:token]
  Share --> User
```

## Data Flow

The user starts on the landing page and enters AI tools, plan IDs, seat counts, monthly spend, team size, company stage, and primary use case. `components/SpendForm.tsx` writes those values into the Zustand store in `lib/store.ts`, which also persists the draft locally so refreshes do not wipe the audit.

When the user runs the audit, the app navigates to the results page and passes the current `AuditInput` into `analyzeSpend` in `lib/auditEngine.ts`. The engine calculates enabled tools, total monthly and annual spend, plan-fit issues, redundant tool pairs, unused seats, API-versus-subscription checks, discounted-credit eligibility, health score, per-tool results, and deterministic fallback summary text.

The results page renders the deterministic report immediately. It then calls `/api/summarize`, which sanitizes the report and asks Anthropic for a one-paragraph CFO-style summary using `lib/auditSummary.ts`; if Anthropic is unavailable, the route returns the local fallback summary.

When the user submits the lead form, `components/LeadCapture.tsx` posts email, company, role, honeypot value, visible time, input, and report to `/api/leads`. The route validates email, rejects very fast submissions, quietly filters honeypot submissions, hashes IP addresses for rate limiting, writes the lead and audit JSON to Supabase, sends a Resend email, and returns `/audit/share/:token` when Supabase is configured.

Public share pages use `lib/sharedAudit.ts` to read the audit JSON by share token from Supabase. The share page renders only report data, not private lead fields.

## Stack Justification

Next.js App Router gives the project a single framework for the landing page, client audit UI, API routes, Open Graph image route, and share pages. React client components are used where form state and result interactions need browser APIs.

Zustand keeps the multi-tool form state small and predictable. It avoids a larger Redux setup while still giving the app a central store, actions, and local-storage persistence.

Supabase is used because the backend is fundamentally relational: leads, unique share tokens, timestamps, IP hashes, and JSON audit payloads. Postgres also makes rate-limit checks and future analytics straightforward.

Anthropic is used only for summarization, not financial logic. The deterministic audit engine remains the source of truth, and the model turns those findings into readable prose.

Resend handles transactional report emails with minimal API surface. The route degrades gracefully when `RESEND_API_KEY` is absent.

Vitest with jsdom covers the deterministic engine and the client lead form without needing a full browser test harness for every run.

## Scaling Plan for 10k Audits Per Day

1. Move lead writes and email dispatch into an async queue or Supabase Edge Function so `/api/leads` can return quickly and retry email failures independently.

2. Cache public share pages at the edge by share token because audit reports are immutable after creation. The page can use a long CDN TTL with manual invalidation only if deletion is added.

3. Add Supabase connection pooling through the Supabase pooler and keep serverless functions from opening excess direct Postgres connections during bursts.

4. Rate-limit at the edge before API route execution using IP hash and coarse request windows, then keep the current Supabase-backed hourly limit as a second layer.

5. Cache pricing metadata in code and ship it with the client bundle; pricing changes should be reviewed and deployed, not fetched on every audit.

6. Put `/api/summarize` behind a short timeout and store the generated summary with the lead so share pages do not call Anthropic.

7. Add structured logging for audit volume, lead conversion, Anthropic fallback rate, Resend failure rate, and Supabase insert latency.
