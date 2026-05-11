# Credex AI Spend Audit

Credex is a free AI spend audit for founders, engineering leads, and finance/ops teams who need to understand whether their AI subscriptions and API spend are wasteful, redundant, or already lean. The app collects tool plans, seat counts, and monthly spend, then returns deterministic savings recommendations, a health score, an AI-written summary, and an optional shareable report link.

[SCREENSHOT: landing page with hero copy, start-audit button, and spend form entry point]
[SCREENSHOT: audit form showing AI tool plan, seat, and monthly spend controls]
[SCREENSHOT: results page with monthly savings, health score, per-tool findings, and lead capture form]

Deployed URL: https://credex.rocks

## Quick Start

```bash
git clone https://github.com/sneha-860/Credex_Assignment.git
cd Credex_Assignment
npm install
npm run dev
```

Create `.env.local` with the values below. The app runs without most server integrations, but share pages and emails require Supabase and Resend.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_URL=https://github.com/sneha-860/Credex_Assignment
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_SUMMARY_MODEL=claude-3-5-haiku-20241022
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Credex <onboarding@resend.dev>
IP_HASH_SALT=replace-with-a-long-random-string
```

Useful commands:

```bash
npm run dev
npm run lint
npm run type-check
npm run test -- --run
```

## Decisions

1. Zustand over Redux/Context for form state: the audit form has many small field updates across tools, seats, plans, and manual spend overrides. Zustand keeps those updates colocated in `lib/store.ts`, persists draft state to local storage, and avoids Redux ceremony or Context rerender issues for a small single-purpose app.

2. Hardcoded rules instead of AI for audit logic: the money recommendations must be explainable and repeatable. `lib/auditEngine.ts` uses deterministic rules for redundant coding assistants, team-plan overkill, unused seats, low API spend, and high-value credit opportunities so two users with the same inputs get the same financial answer.

3. Supabase over Firebase: the core backend need is a relational `leads` table with JSON audit data, share-token lookup, rate-limit counting, and simple SQL migrations. Supabase gives Postgres, row-level policies if needed later, and direct SQL ownership without shaping the app around Firebase document patterns.

4. shadcn/ui over building components from scratch: the UI needs accessible buttons, inputs, selects, cards, and switches, not a custom component library. shadcn-style components keep the generated markup readable, Tailwind-native, and easy to modify while leaning on Radix primitives for tricky controls.

5. Haiku over Sonnet for AI summary: the summary is short, constrained, and non-critical because deterministic findings already contain the financial logic. Claude Haiku is fast and cheaper for turning structured audit results into one CFO-style paragraph, while Sonnet would add cost without meaningfully improving this narrow copy task.
