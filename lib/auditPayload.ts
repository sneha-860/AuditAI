import type { AuditRecommendation, AuditReport, ToolResult } from "@/types";

const VALID_STATUSES = new Set(["optimal", "minor", "action"]);
const VALID_CATEGORIES = new Set(["plan-fit", "redundancy", "alternative", "credits", "usage", "status"]);
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
const VALID_SEVERITY = new Set(["good", "minor", "action"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 1000) : fallback;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string").slice(0, 12);
}

function sanitizeToolResult(value: unknown): ToolResult | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  const status = stringValue(item.status);

  return {
    toolId: stringValue(item.toolId) as ToolResult["toolId"],
    toolName: stringValue(item.toolName, "Unknown tool"),
    planName: stringValue(item.planName),
    currentSpend: numberValue(item.currentSpend),
    recommendedSpend: numberValue(item.recommendedSpend),
    estimatedSavings: numberValue(item.estimatedSavings),
    recommendation: stringValue(item.recommendation, "Review this tool"),
    status: VALID_STATUSES.has(status) ? (status as ToolResult["status"]) : "minor",
    reason: stringValue(item.reason)
  };
}

function sanitizeRecommendation(value: unknown): AuditRecommendation | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  const category = stringValue(item.category);
  const confidence = stringValue(item.confidence);
  const severity = stringValue(item.severity);
  const monthlySavings = numberValue(item.monthlySavings);

  return {
    id: stringValue(item.id, `rec-${Math.random().toString(36).slice(2)}`),
    category: VALID_CATEGORIES.has(category) ? (category as AuditRecommendation["category"]) : "status",
    toolIds: stringArray(item.toolIds) as AuditRecommendation["toolIds"],
    title: stringValue(item.title, "Optimization opportunity"),
    action: stringValue(item.action, "Review this recommendation"),
    currentCost: numberValue(item.currentCost),
    recommendedCost: numberValue(item.recommendedCost),
    monthlySavings,
    annualSavings: numberValue(item.annualSavings) || monthlySavings * 12,
    confidence: VALID_CONFIDENCE.has(confidence) ? (confidence as AuditRecommendation["confidence"]) : "medium",
    reason: stringValue(item.reason),
    severity: VALID_SEVERITY.has(severity) ? (severity as AuditRecommendation["severity"]) : "minor"
  };
}

export function sanitizeAuditReport(value: unknown): AuditReport | null {
  const report = asRecord(value);
  if (!report) {
    return null;
  }

  const toolResults = Array.isArray(report.toolResults)
    ? report.toolResults.map(sanitizeToolResult).filter((item): item is ToolResult => Boolean(item))
    : [];
  const recommendations = Array.isArray(report.recommendations)
    ? report.recommendations.map(sanitizeRecommendation).filter((item): item is AuditRecommendation => Boolean(item))
    : [];

  if (toolResults.length === 0) {
    return null;
  }

  return {
    totalMonthlySpend: numberValue(report.totalMonthlySpend),
    totalAnnualSpend: numberValue(report.totalAnnualSpend),
    totalMonthlySavings: numberValue(report.totalMonthlySavings),
    totalAnnualSavings: numberValue(report.totalAnnualSavings),
    isHighValue: Boolean(report.isHighValue),
    healthScore: Math.max(0, Math.min(100, numberValue(report.healthScore))),
    toolResults,
    recommendations,
    creditsOpportunity: undefined,
    summary: stringValue(report.summary)
  };
}
