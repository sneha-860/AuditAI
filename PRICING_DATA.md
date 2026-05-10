# Pricing Data

Date verified: 2026-05-09. Currency: USD. Prices below are the values currently encoded in `lib/pricing.ts`; source URLs are the vendor pricing or billing pages used to verify them. `null` means custom pricing or user-entered API spend.

| Tool | Plan ID | Plan name | Billing model | Monthly price | Annual monthly price | Source URL | Date verified | Notes |
|---|---|---|---:|---:|---:|---|---|---|
| Cursor | hobby | Hobby | free | 0 | 0 | https://cursor.com/pricing | 2026-05-09 | Free individual plan. |
| Cursor | pro | Pro | per-seat | 20 | 16 | https://cursor.com/pricing | 2026-05-09 | App uses $16 annual monthly equivalent. |
| Cursor | business | Business | per-seat | 40 | 40 | https://cursor.com/pricing | 2026-05-09 | Public page now labels team plan as Teams at $40/user/month. |
| Cursor | enterprise | Enterprise | custom | null | null | https://cursor.com/pricing | 2026-05-09 | Contact sales. |
| GitHub Copilot | individual | Individual | per-seat | 10 | 8.33 | https://github.com/features/copilot/plans | 2026-05-09 | Public page labels individual paid plan as Pro. |
| GitHub Copilot | business | Business | per-seat | 19 | 19 | https://docs.github.com/en/billing/concepts/product-billing/github-copilot | 2026-05-09 | Organization plan at $19/user/month. |
| GitHub Copilot | enterprise | Enterprise | per-seat | 39 | 39 | https://docs.github.com/en/billing/concepts/product-billing/github-copilot | 2026-05-09 | Enterprise plan at $39/user/month. |
| Claude | free | Free | free | 0 | 0 | https://www.anthropic.com/pricing | 2026-05-09 | Free Claude chat tier. |
| Claude | pro | Pro | per-seat | 20 | 16.67 | https://www.anthropic.com/pricing | 2026-05-09 | Anthropic lists $20 monthly and $200 annually. |
| Claude | max | Max | per-seat | 100 | 100 | https://support.claude.com/en/articles/11049741-what-is-the-max-plan | 2026-05-09 | App models the Max 5x tier; Anthropic also offers Max 20x at $200/month. |
| Claude | team | Team | per-seat | 30 | 25 | https://www.anthropic.com/pricing | 2026-05-09 | Minimum member rules are not enforced in app logic. |
| Claude | enterprise | Enterprise | custom | 20 | 20 | https://www.anthropic.com/pricing | 2026-05-09 | App keeps an editable estimate; actual enterprise pricing is sales-led. |
| Claude | api-direct | API Direct | api | null | null | https://www.anthropic.com/pricing | 2026-05-09 | User enters monthly API spend manually. |
| ChatGPT | plus | Plus | per-seat | 20 | 20 | https://chatgpt.com/pricing/ | 2026-05-09 | Individual Plus plan. |
| ChatGPT | pro | Pro | per-seat | 200 | 200 | https://chatgpt.com/pricing/ | 2026-05-09 | App models the established $200/month Pro plan. |
| ChatGPT | team | Business | per-seat | 30 | 25 | https://chatgpt.com/pricing/ | 2026-05-09 | Stored as `team` for compatibility; UI presents Business. |
| ChatGPT | business | Business | per-seat | 30 | 25 | https://chatgpt.com/pricing/ | 2026-05-09 | Same price model as `team` alias in app data. |
| ChatGPT | enterprise | Enterprise | custom | null | null | https://chatgpt.com/pricing/ | 2026-05-09 | Contact sales. |
| ChatGPT | api-direct | API Direct | api | null | null | https://openai.com/api/pricing/ | 2026-05-09 | User enters monthly API spend manually. |
| Anthropic API Direct | monthly-spend | Monthly spend | api | null | null | https://www.anthropic.com/pricing | 2026-05-09 | User-entered monthly spend because API cost depends on model and tokens. |
| OpenAI API Direct | monthly-spend | Monthly spend | api | null | null | https://openai.com/api/pricing/ | 2026-05-09 | User-entered monthly spend because API cost depends on model and tokens. |
| Gemini | pro | Pro | included | 0 | 0 | https://gemini.google/subscriptions/ | 2026-05-09 | App treats basic Gemini access as included/free. |
| Gemini | ai-pro | AI Pro | per-seat | 19.99 | 19.99 | https://gemini.google/subscriptions/ | 2026-05-09 | Present in pricing table for future UI support. |
| Gemini | ultra | Ultra | per-seat | 249.99 | 249.99 | https://gemini.google/subscriptions/ | 2026-05-09 | Google AI Ultra individual subscription. |
| Gemini | api | API | api | null | null | https://ai.google.dev/gemini-api/docs/pricing | 2026-05-09 | User-entered monthly API spend when exposed. |
| Windsurf | free | Free | free | 0 | 0 | https://windsurf.com/pricing | 2026-05-09 | Free individual plan. |
| Windsurf | pro | Pro | per-seat | 20 | 20 | https://windsurf.com/pricing | 2026-05-09 | Individual Pro plan. |
| Windsurf | max | Max | per-seat | 200 | 200 | https://windsurf.com/pricing | 2026-05-09 | Present in pricing table for future UI support. |
| Windsurf | teams | Teams | per-seat | 40 | 40 | https://windsurf.com/pricing | 2026-05-09 | Team plan at $40/user/month. |
| Windsurf | enterprise | Enterprise | custom | null | null | https://windsurf.com/pricing | 2026-05-09 | Contact sales. |
