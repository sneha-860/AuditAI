# Prompts

## Anthropic Summary Prompt

The summarization code lives in `lib/auditSummary.ts`. The API call uses this system prompt:

```text
You are a financial advisor specializing in SaaS spend optimization for startups. Be direct, specific, and use exact dollar amounts. Never be vague. Tone: like a smart CFO colleague, not a salesperson.
```

The user prompt is built from the current audit input and deterministic report:

```text
Generate a 100-word audit summary for this startup's AI tool spend:

Team size: ${input.totalTeamSize}
Company stage: ${input.companyStage}
Primary use case: ${input.primaryUseCase}
Total current monthly spend: $${report.totalMonthlySpend}
Total potential monthly savings: $${report.totalMonthlySavings}

Top findings:
${findings
  .map((finding) => `- ${finding.toolName}: ${finding.recommendation} (save $${finding.estimatedSavings}/mo)`)
  .join("\n")}

Write ONE paragraph. Start with their biggest win. End with what they should do this week. Use "you" and "your team". Include the exact savings numbers.
Do not use bullet points. Do not use headers.
```

The current model default is:

```text
claude-3-5-haiku-20241022
```

## Why It Is Written This Way

The system prompt makes the model behave like a CFO colleague because the app is about spend decisions, not generic productivity advice. The prompt requires exact dollar amounts so the AI summary cannot hand-wave the core value proposition. It also asks for one paragraph with no bullets or headers because the results page already has structured cards; the AI copy should be a readable executive summary, not another list.

The model receives only deterministic findings from the audit engine. It does not invent recommendations or calculate savings. This keeps the financial logic inspectable in `lib/auditEngine.ts` while still giving users a polished summary.

Haiku is used because the task is short-form rewriting over structured data. Sonnet was not necessary for a 100-word summary and would increase cost and latency.

## What Did Not Work

I tried asking for HTML output, but the model added unwanted formatting and occasionally introduced markup that clashed with the results page styling.

I tried a looser "summarize this audit" prompt, but the model sometimes softened the recommendation and omitted exact savings numbers.

I tried allowing bullets, but the result duplicated the per-tool breakdown and made the summary feel less like an executive takeaway.

I tried passing every recommendation in full, but the output became too long and sometimes buried the biggest win. Limiting the prompt to the top findings keeps it focused.
