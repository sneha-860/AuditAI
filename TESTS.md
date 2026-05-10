# Tests

Run all tests:

```bash
npm run test -- --run
```

Run the UI watcher:

```bash
npm run test -- --ui
```

## Test List

| Filename | Test | What it covers |
|---|---|---|
| `tests/auditEngine.test.ts` | `redundancy: Cursor Pro + GitHub Copilot flags as redundant` | Verifies overlapping coding assistants create a redundancy finding and savings equal the cheaper tool. |
| `tests/auditEngine.test.ts` | `plan fit: Team plan for 2 users flags as overkill` | Verifies GitHub Copilot Business with 2 seats recommends Individual and saves $18/month. |
| `tests/auditEngine.test.ts` | `no false savings: already on optimal plan returns no recommendations` | Verifies Cursor Pro for one coding user stays optimal with no savings recommendation. |
| `tests/auditEngine.test.ts` | `high value flag: >$500/mo total triggers credex CTA` | Verifies a $600/month stack sets `isHighValue` and makes the credit CTA prominent. |
| `tests/auditEngine.test.ts` | `unused seats: 10 seats for 5-person team flags waste` | Verifies unused-seat detection finds 5 unused GitHub Copilot seats and $50/month savings. |
| `tests/auditEngine.test.ts` | `API vs subscription: low API spend suggests subscription` | Verifies $8/month Anthropic API writing usage suggests considering Claude Pro value below the review threshold. |
| `tests/auditEngine.test.ts` | `health score: perfect setup scores high` | Verifies Claude Pro for a solo writing user scores at least 80. |
| `tests/auditEngine.test.ts` | `savings calculation: monthly and annual both correct` | Verifies report and recommendation annual savings equal monthly savings times 12. |
| `tests/auditEngine.test.ts` | `zero spend: free tools only returns honest "no savings" report` | Verifies free-tier stacks report $0 savings and acknowledge $0 current AI cash spend. |
| `tests/auditEngine.test.ts` | `annual savings display: large savings formatted correctly` | Verifies $1,000/month savings formats as `$12,000/year`. |
| `tests/components/LeadCapture.test.tsx` | `Honeypot field is in DOM but not visible` | Verifies the bot-trap website field exists while remaining hidden from users. |
| `tests/components/LeadCapture.test.tsx` | `Submit disabled until email is valid` | Verifies the lead form cannot submit empty or invalid email values. |
| `tests/components/LeadCapture.test.tsx` | `Success state shows share URL after mock API call` | Verifies a mocked `/api/leads` success response renders the returned share URL. |
