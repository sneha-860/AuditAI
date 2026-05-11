# User Interviews

These are synthetic discovery notes based on the target users for this assignment, not live customer quotes. They are written as completed interviews so the product decisions can be traced back to user needs.

## Interview 1: Seed-Stage Founder

Role: Founder at a 7-person B2B SaaS startup.

Current AI stack:
- Cursor Pro for 3 engineers
- ChatGPT Plus for founder and ops
- GitHub Copilot for 2 engineers
- Occasional OpenAI API spend

Answers:
- The team does not have a formal AI tools budget; purchases happen whenever someone needs a tool.
- Subscription review happens only when runway gets tight or a card statement looks high.
- The founder wants a fast estimate first, then source links before making cancellation decisions.
- They would share a report with the engineering lead before cutting developer tools.
- They care less about perfect accounting and more about spotting obvious overlap.

Takeaway:
The product should show savings quickly, keep recommendations explainable, and avoid sounding too absolute when engineering workflows are involved.

## Interview 2: Engineering Manager

Role: Engineering manager at a 15-person product team.

Current AI stack:
- Cursor Business for most engineers
- GitHub Copilot Business for legacy GitHub workflow
- Claude Pro for product/spec writing
- ChatGPT Business for cross-functional team members

Answers:
- The manager suspects duplicate spend but does not want to remove a tool that developers rely on daily.
- The most useful signal is not just price, but whether two tools solve the same job.
- They want recommendations grouped by "drop", "downgrade", or "review".
- A shareable report is useful because budget decisions involve founders and finance.
- They would trust the audit more if pricing dates and sources are visible.

Takeaway:
The audit needs to separate duplicate-tool findings from simple price comparisons, and the pricing documentation must be easy to inspect.

## Interview 3: Ops/Finance Lead

Role: Operations lead at a 25-person startup.

Current AI stack:
- ChatGPT Business
- Gemini through Google Workspace
- Claude Team for a few writers
- Multiple API bills owned by engineering

Answers:
- They see charges but often do not know which team owns each tool.
- The biggest pain is getting a quick monthly number to discuss in budget meetings.
- They prefer conservative savings estimates over aggressive claims.
- They want a no-signup flow because they are wary of uploading billing data.
- They would use a share link if it summarized the result clearly.

Takeaway:
The app should keep the entry flow lightweight, show monthly and annual savings, and make the shared report readable for nontechnical stakeholders.

## Product Decisions From Interviews

- Keep the first audit under one minute.
- Show a clear current monthly total based only on enabled tools.
- Label mocked social proof so trust is not damaged.
- Include pricing documentation with verification dates.
- Generate share pages and social previews that highlight the savings number.
- Treat recommendations as decision support, not automatic cancellation instructions.

## Remaining Questions

- Should future versions import billing data from Stripe, Ramp, or QuickBooks?
- Should recommendations include usage-frequency questions before suggesting cancellation?
- How often should pricing data be re-verified for public credibility?
