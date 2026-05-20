# AuditAI Pricing Data

This data powers the AuditAI rules engine. AuditAI uses these reference prices to estimate monthly AI spend, compare overlapping tools, flag plan mismatches, and calculate potential savings opportunities. Prices are in USD and were verified in May 2026.

| Tool | Plan | Price | Billed | Source | Verified |
| --- | --- | ---: | --- | --- | --- |
| Cursor | Hobby | $0/seat/month | Free | https://cursor.com/pricing | May 2026 |
| Cursor | Pro | $20/seat/month | Monthly subscription | https://cursor.com/pricing | May 2026 |
| Cursor | Teams | $40/seat/month | Monthly subscription | https://cursor.com/pricing | May 2026 |
| Cursor | Enterprise | Custom | Contract | https://cursor.com/pricing | May 2026 |
| GitHub Copilot | Free | $0/seat/month | Free | https://github.com/features/copilot/plans | May 2026 |
| GitHub Copilot | Pro | $10/seat/month | Monthly subscription | https://github.com/features/copilot/plans | May 2026 |
| GitHub Copilot | Pro+ | $39/seat/month | Monthly subscription | https://github.com/features/copilot/plans | May 2026 |
| GitHub Copilot | Business | $19/seat/month | Monthly subscription | https://github.com/features/copilot/plans | May 2026 |
| GitHub Copilot | Enterprise | $39/seat/month | Monthly subscription | https://github.com/features/copilot/plans | May 2026 |
| Claude (Anthropic) | Free | $0/seat/month | Free | https://claude.com/pricing | May 2026 |
| Claude (Anthropic) | Pro | $20/seat/month | Monthly subscription | https://support.anthropic.com/en/articles/8325610-how-much-does-claude-pro-cost | May 2026 |
| Claude (Anthropic) | Max | $100/seat/month | Monthly subscription | https://support.claude.com/en/articles/11049741-what-is-the-max-plan | May 2026 |
| Claude (Anthropic) | Team | $30/seat/month | Monthly subscription | https://claude.com/pricing | May 2026 |
| Claude (Anthropic) | Enterprise | Custom | Contract | https://claude.com/pricing | May 2026 |
| ChatGPT (OpenAI) | Free | $0/seat/month | Free | https://openai.com/chatgpt/pricing/ | May 2026 |
| ChatGPT (OpenAI) | Plus | $20/seat/month | Monthly subscription | https://openai.com/chatgpt/pricing/ | May 2026 |
| ChatGPT (OpenAI) | Business | $30/seat/month | Monthly subscription; $25/seat/month when billed annually | https://help.openai.com/en/articles/8792828-what-is-chatgpt-team/ | May 2026 |
| ChatGPT (OpenAI) | Pro | $200/seat/month | Monthly subscription | https://openai.com/chatgpt/pricing/ | May 2026 |
| ChatGPT (OpenAI) | Enterprise | Custom | Contract | https://openai.com/chatgpt/pricing/ | May 2026 |
| Anthropic API | Claude Sonnet 4.5 | Usage-based; $3 input / $15 output per 1M tokens | API metered usage | https://platform.claude.com/docs/en/about-claude/pricing | May 2026 |
| Anthropic API | Claude Haiku 4.5 | Usage-based; $1 input / $5 output per 1M tokens | API metered usage | https://platform.claude.com/docs/en/about-claude/pricing | May 2026 |
| Anthropic API | Claude Opus 4.7 | Usage-based; $15 input / $75 output per 1M tokens | API metered usage | https://platform.claude.com/docs/en/about-claude/pricing | May 2026 |
| OpenAI API | GPT-5.5 | Usage-based; $5 input / $30 output per 1M tokens | API metered usage | https://openai.com/api/pricing/ | May 2026 |
| OpenAI API | GPT-5.4 | Usage-based; $2.50 input / $15 output per 1M tokens | API metered usage | https://openai.com/api/pricing/ | May 2026 |
| OpenAI API | GPT-5.4 mini | Usage-based; $0.75 input / $4.50 output per 1M tokens | API metered usage | https://openai.com/api/pricing/ | May 2026 |
| Gemini | Free | $0/seat/month | Free | https://gemini.google/subscriptions/ | May 2026 |
| Gemini | Google AI Pro | $19.99/seat/month | Monthly subscription | https://gemini.google/subscriptions/ | May 2026 |
| Gemini | Google AI Ultra | $249.99/seat/month | Monthly subscription | https://gemini.google/subscriptions/ | May 2026 |
| Gemini | Gemini API | Usage-based | API metered usage | https://ai.google.dev/gemini-api/docs/pricing | May 2026 |
| Windsurf | Free | $0/seat/month | Free | https://windsurf.com/pricing | May 2026 |
| Windsurf | Pro | $20/seat/month | Monthly subscription | https://windsurf.com/pricing | May 2026 |
| Windsurf | Max | $200/seat/month | Monthly subscription | https://windsurf.com/pricing | May 2026 |
| Windsurf | Teams | $40/seat/month | Monthly subscription | https://windsurf.com/pricing | May 2026 |
| Windsurf | Enterprise | Custom | Contract | https://windsurf.com/pricing | May 2026 |

## Methodology

AuditAI calculates savings by normalizing each selected tool to an estimated monthly cost. Seat-based subscriptions use:

`monthly spend = seats x price per seat per month`

Annual plans are converted to their effective monthly rate when the product exposes annual pricing. API products are usage-based, so AuditAI uses the customer-entered monthly spend or measured billing export instead of a fixed seat price.

Savings opportunities are estimated by comparing current spend against recommended spend after applying the rules engine. The rules engine looks for unused seats, duplicate tools serving the same workflow, plan tiers that exceed the user's stated use case, and API spend that can be capped, routed, or replaced with a lower-cost model. The estimated savings value is:

`estimated monthly savings = current monthly spend - recommended monthly spend`

Custom and enterprise plans are treated as manually entered values because vendor pricing varies by contract, committed usage, discounts, region, taxes, and procurement terms.
