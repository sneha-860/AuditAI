import type { AuditInput, AuditReport } from "@/types";
import { formatDollars } from "@/lib/format";

export type AuditSummaryPayload = {
  input: AuditInput;
  report: AuditReport;
};

type AnthropicMessageResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

const ANTHROPIC_TIMEOUT_MS = 5000;

export function buildSummaryPrompt({ input, report }: AuditSummaryPayload): string {
  const findings = report.toolResults
    .filter((finding) => finding.estimatedSavings > 0 || finding.status !== "optimal")
    .slice(0, 5);

  return `Generate a 100-word audit summary for this startup's AI tool spend:

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
Do not use bullet points. Do not use headers.`;
}

export function buildFallbackSummary({ input: _input, report }: AuditSummaryPayload): string {
  const issues = report.recommendations.filter((recommendation) => recommendation.monthlySavings > 0);
  const topFinding = issues[0]?.title ?? report.toolResults[0]?.recommendation ?? "reviewing your highest-confidence recommendations";

  return `Your team is spending ${formatDollars(report.totalMonthlySpend)}/month on AI tools. Our audit found ${issues.length} optimization opportunities totaling ${formatDollars(report.totalMonthlySavings)}/month (${formatDollars(report.totalMonthlySavings * 12)}/year) in potential savings. The biggest opportunity is ${topFinding}. Review the breakdown below and consider acting on the highest-confidence recommendations first.`;
}

export async function generateAuditSummary(payload: AuditSummaryPayload): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = buildFallbackSummary(payload);

  if (!apiKey) {
    return fallback;
  }

  const controller = new AbortController();
  const timeout = windowlessTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_SUMMARY_MODEL ?? "claude-3-5-haiku-20241022",
        max_tokens: 180,
        temperature: 0.2,
        system:
          "You are a financial advisor specializing in SaaS spend optimization for startups. Be direct, specific, and use exact dollar amounts. Never be vague. Tone: like a smart CFO colleague, not a salesperson.",
        messages: [
          {
            role: "user",
            content: buildSummaryPrompt(payload)
          }
        ]
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    return data.content?.find((part) => part.text)?.text?.trim() || fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

function windowlessTimeout(callback: () => void, ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(callback, ms);
}
