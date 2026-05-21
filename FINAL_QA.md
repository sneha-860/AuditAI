# Final QA Checklist

Date: 2026-05-11

## Local Verification

- [x] All 10+ tests pass. Result: 13 Vitest tests passed across 2 files on 2026-05-11.
- [x] Lint passes with `npm run lint` on 2026-05-11.
- [x] TypeScript passes with `npm run type-check` on 2026-05-11.
- [x] Production build passes with `npm run build` on 2026-05-11. Note: Next.js warns that using edge runtime on a page disables static generation for that page.
- [x] CI workflow exists at `.github/workflows/ci.yml` and runs install, lint, type-check, tests, and a JSON-based test count check.
- [x] Form state is kept in-memory through the Zustand store in `lib/store.ts`.
- [x] Audit engine handles covered edge cases: all-free tools, single optimal tool, redundant tools, unused seats, high-value spend, low API spend, and savings formatting.
- [x] AI summary has a deterministic fallback in `lib/auditSummary.ts` when Anthropic is unavailable.
- [x] Environment variables are documented in `README.md` and secrets are read from environment variables in server routes.
- [x] `PRICING_DATA.md` includes vendor URLs and this week's verification date, 2026-05-09.

## Deployment And Credential Checks

- [ ] All 6 MVP features work end-to-end on deployed URL `https://credex.rocks`. Current blocker: the live root page appears to serve the broader Credex marketplace site, not this AI spend audit app.
- [ ] Email sends successfully to a real inbox through Resend.
- [ ] Share URL works against production Supabase and shows stripped audit data only.
- [ ] OG image renders when tested with opengraph.xyz.
- [ ] Lighthouse mobile score is Performance >= 85 and Accessibility >= 90.
- [ ] CI shows green on GitHub after the latest commit is pushed.
- [ ] No console errors on deployed landing, audit, results, share, and API-backed flows.

## Manual Browser Checks

- [ ] Mobile responsive at 375px width: landing page, audit form, results page, lead capture success state.
- [ ] Form state resets to default entries after a fresh page load.
- [ ] AI summary displays a loading/skeleton state before final or fallback summary.
- [ ] Audit engine handles browser edge cases: all free, 1 tool, and 20 tools/every available tool enabled.
- [ ] Share link copy button copies an absolute URL.

## Documentation Status

- [x] `README.md` covers summary, screenshots, quick start, environment variables, decisions, and deployed URL.
- [x] `ARCHITECTURE.md` covers system diagram, data flow, stack choices, and 10k/day scaling plan.
- [x] `PRICING_DATA.md` lists tools, plans, prices, URLs, and verification dates.
- [x] `PROMPTS.md` includes the Anthropic prompt and prompt rationale.
- [x] `TESTS.md` lists all implemented tests and how to run them.
- [x] `GTM.md` defines the target user, channels, launch plan, unfair distribution, and Week 1 traction goal.
- [x] `ECONOMICS.md` shows lead value, CAC, and $1M ARR math.
- [x] `LANDING_COPY.md` contains hero, CTA, mocked social proof, and FAQ.
- [x] `METRICS.md` defines the north star, input metrics, instrumentation, and pivot trigger.
- [ ] `DEVLOG.md` has all 6 entries. Not present yet; Day 7 entry should be added on Day 7.
