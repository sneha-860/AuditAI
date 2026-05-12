# AuditAI

AuditAI is a production-ready AI spend audit tool for startup teams. It collects AI subscriptions, plans, seats, and API spend, then returns deterministic savings recommendations, a spend health score, an AI-generated summary, lead capture, and shareable audit reports.

Production URL: `https://credex-assignment-vercel.vercel.app/`

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand for persisted audit form state
- Radix/shadcn-style form controls
- Supabase for lead and share-report storage
- Resend for report email delivery
- `@vercel/og` for share image generation

## Local Setup

```bash
npm install
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` with the production variables below.   

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_SUMMARY_MODEL=claude-3-5-haiku-20241022
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Credex <onboarding@resend.dev>
IP_HASH_SALT=replace-with-a-long-random-string
```

For active development with hot reload:

```bash
npm run dev:local
```

Open `http://127.0.0.1:3000`.

For production parity locally:

```bash
npm run build
npm run start:local
```

## Scripts

```bash
npm run dev          # Next dev server
npm run dev:local    # Next dev server bound to 127.0.0.1:3000
npm run build        # Production build 
npm run start:local  # Serve the production build on 127.0.0.1:3000
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Vitest test suite
```

## Production Environment

Set these variables in the deployment provider:

```bash
NEXT_PUBLIC_SITE_URL=https://credex.rocks
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_SUMMARY_MODEL=claude-3-5-haiku-20241022
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Credex <your_verified_sender_domain>
IP_HASH_SALT=replace-with-a-long-random-string
```

Notes:

- The app can calculate audit results without Supabase, Resend, or Anthropic, but production lead capture, email delivery, AI summaries, and share pages require the relevant integrations.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, or `IP_HASH_SALT` to the client.
- `NEXT_PUBLIC_SITE_URL` should be the canonical public origin used for share links and metadata.

## Database

Apply the Supabase migration before enabling production lead capture:

```bash
supabase/migrations/001_create_leads.sql
```

The `leads` table stores contact details, sanitized audit payloads, total monthly savings, share tokens, IP hashes for rate limiting, and honeypot status.

## Production Verification

Run before deploying:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Manual QA checklist:

- Landing page loads at `/`.
- Spend form defaults render correctly, including Cursor Pro and current total.
- Tool rows remain one-line on desktop and usable on mobile.
- `/audit` shows savings, health score, summary, tool findings, and lead capture.
- Lead capture rejects invalid email and submits valid payloads.
- Share links resolve at `/audit/share/[token]`.
- Open Graph image resolves at `/api/og?token=[token]`.
- No visible GitHub links appear in public navigation or footer.

## Deployment

The app is optimized for Vercel or any Node-compatible Next.js host.

Recommended Vercel flow:

1. Import the repository.
2. Set the production environment variables above.
3. Use the default install command: `npm install`.
4. Use the default build command: `npm run build`.
5. Deploy.


## Architecture Notes

- `lib/auditEngine.ts` is deterministic and is the source of truth for savings, recommendations, and health score.
- `lib/pricing.ts` owns tool pricing and plan definitions.
- `lib/store.ts` owns persisted audit form state and normalizes cached values across releases.
- `components/SpendForm.tsx` renders the audit input experience.
- `components/AuditResults.tsx` renders the private results page.
- `components/LeadCapture.tsx` handles report email capture and share-link success state.
- `app/audit/share/[token]/page.tsx` renders public share reports with identifying details stripped.

## Design QA

AuditAI is a dark, premium, financial-grade UI. Keep text readable, avoid decorative clutter, and treat numbers as the primary visual hierarchy. Public pages should remain free of outbound GitHub links and unrelated marketing navigation.
