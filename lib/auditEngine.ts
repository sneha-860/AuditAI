import { TOOL_MAP } from "@/lib/pricing";
import type { AuditInput, AuditResult, ToolResult } from "@/types";

export function getEnabledTools(input: AuditInput) {
  return Object.values(input.tools).filter((tool) => tool.enabled);
}

export function calculateAudit(input: AuditInput): AuditResult {
  const toolResults: ToolResult[] = getEnabledTools(input).map((toolInput) => {
    const tool = TOOL_MAP[toolInput.toolId];
    const currentSpend = Math.max(0, toolInput.monthlySpend);
    const estimatedSavings = Math.round(currentSpend * 0.22);

    return {
      toolId: toolInput.toolId,
      toolName: tool.name,
      currentSpend,
      recommendedSpend: Math.max(0, currentSpend - estimatedSavings),
      estimatedSavings,
      recommendation: "Review seat usage and consolidate overlapping plans before renewal."
    };
  });

  const totalMonthlySpend = toolResults.reduce((sum, result) => sum + result.currentSpend, 0);
  const estimatedMonthlySavings = toolResults.reduce((sum, result) => sum + result.estimatedSavings, 0);

  return {
    totalMonthlySpend,
    estimatedMonthlySavings,
    estimatedAnnualSavings: estimatedMonthlySavings * 12,
    toolResults,
    summary: "Your audit is ready. Credex can help benchmark plans and find discounted AI credits."
  };
}
