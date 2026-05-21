import { NextResponse } from "next/server";
import { sanitizeAuditReport } from "@/lib/auditPayload";
import { buildFallbackSummary, generateAuditSummary } from "@/lib/auditSummary";
import { corsPreflight, withCors } from "@/lib/cors";
import type { AuditInput, AuditReport } from "@/types";

/*
PROMPTS.md

System:
You are a financial advisor specializing in SaaS spend optimization for startups.
Be direct, specific, and use exact dollar amounts. Never be vague.
Tone: like a smart CFO colleague, not a salesperson.

User:
Generate a 100-word audit summary for this startup's AI tool spend:

Team size: {teamSize}
Company stage: {stage}
Primary use case: {useCase}
Total current monthly spend: ${totalSpend}
Total potential monthly savings: ${totalSavings}

Top findings:
{findings.map(f => `- ${f.tool}: ${f.recommendation} (save $${f.monthlySavings}/mo)`).join('\n')}

Write ONE paragraph. Start with their biggest win. End with what they should
do this week. Use "you" and "your team". Include the exact savings numbers.
Do not use bullet points. Do not use headers.

Fallback:
"Your team is spending ${totalSpend}/month on AI tools. Our audit found
${numIssues} optimization opportunities totaling $${totalSavings}/month
($${totalSavings*12}/year) in potential savings. The biggest opportunity is
${topFinding}. Review the breakdown below and consider acting on the
highest-confidence recommendations first."
*/

export const OPTIONS = corsPreflight;

export const POST = withCors(async function POST(request: Request) {
  let body: { input?: AuditInput; report?: AuditReport };

  try {
    body = (await request.json()) as { input?: AuditInput; report?: AuditReport };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.input || !body.report) {
    return NextResponse.json({ error: "Audit input and report are required." }, { status: 400 });
  }

  const report = sanitizeAuditReport(body.report);
  if (!report) {
    return NextResponse.json({ error: "A valid audit report is required." }, { status: 400 });
  }

  const summary = await generateAuditSummary({
    input: body.input,
    report
  });

  return NextResponse.json({
    summary: summary || buildFallbackSummary({ input: body.input, report })
  });
});
