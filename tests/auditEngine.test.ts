import { describe, expect, test } from "vitest";
import { analyzeSpend } from "@/lib/auditEngine";
import { formatAnnualSavings } from "@/lib/format";
import type { AuditInput, CompanyStage, PrimaryUseCase, ToolId, ToolInput } from "@/types";

const TOOL_IDS: ToolId[] = [
  "cursor",
  "github-copilot",
  "claude",
  "chatgpt",
  "anthropic-api",
  "openai-api",
  "gemini",
  "windsurf"
];

const DEFAULT_PLANS: Record<ToolId, string> = {
  cursor: "hobby",
  "github-copilot": "individual",
  claude: "free",
  chatgpt: "plus",
  "anthropic-api": "monthly-spend",
  "openai-api": "monthly-spend",
  gemini: "pro",
  windsurf: "free"
};

function tool(toolId: ToolId, overrides: Partial<ToolInput> = {}): ToolInput {
  return {
    toolId,
    enabled: false,
    planId: DEFAULT_PLANS[toolId],
    seats: 1,
    monthlySpend: 0,
    ...overrides
  };
}

function input({
  tools = [],
  teamSize = 1,
  useCase = "Mixed",
  stage = "Solo/Freelance"
}: {
  tools?: ToolInput[];
  teamSize?: number;
  useCase?: PrimaryUseCase;
  stage?: CompanyStage;
}): AuditInput {
  const byId = Object.fromEntries(TOOL_IDS.map((toolId) => [toolId, tool(toolId)])) as Record<ToolId, ToolInput>;
  for (const enabledTool of tools) {
    byId[enabledTool.toolId] = enabledTool;
  }

  return {
    tools: byId,
    totalTeamSize: teamSize,
    primaryUseCase: useCase,
    companyStage: stage
  };
}

describe("audit engine", () => {
  test("redundancy: Cursor Pro + GitHub Copilot flags as redundant", () => {
    const report = analyzeSpend(input({
      useCase: "Coding",
      tools: [
        tool("cursor", { enabled: true, planId: "pro", monthlySpend: 20 }),
        tool("github-copilot", { enabled: true, planId: "individual", monthlySpend: 10 })
      ]
    }));

    const finding = report.recommendations.find((recommendation) => recommendation.category === "redundancy");
    expect(finding).toBeDefined();
    expect(finding?.toolIds).toEqual(expect.arrayContaining(["cursor", "github-copilot"]));
    expect(finding?.monthlySavings).toBe(10);
  });

  test("plan fit: Team plan for 2 users flags as overkill", () => {
    const report = analyzeSpend(input({
      teamSize: 2,
      useCase: "Coding",
      tools: [tool("github-copilot", { enabled: true, planId: "business", seats: 2, monthlySpend: 38 })]
    }));

    const finding = report.recommendations.find((recommendation) => recommendation.id === "github-copilot-team-overkill");
    expect(finding?.action).toContain("Individual");
    expect(finding?.monthlySavings).toBe(18);
  });

  test("no false savings: already on optimal plan returns no recommendations", () => {
    const report = analyzeSpend(input({
      useCase: "Coding",
      tools: [tool("cursor", { enabled: true, planId: "pro", monthlySpend: 20 })]
    }));

    const cursor = report.toolResults.find((result) => result.toolId === "cursor");
    expect(cursor?.estimatedSavings).toBe(0);
    expect(cursor?.status).toBe("optimal");
    expect(report.recommendations.some((recommendation) => recommendation.toolIds.includes("cursor") && recommendation.monthlySavings > 0)).toBe(false);
  });

  test("high value flag: >$500/mo total triggers credex CTA", () => {
    const report = analyzeSpend(input({
      teamSize: 10,
      useCase: "Mixed",
      tools: [
        tool("chatgpt", { enabled: true, planId: "pro", seats: 2, monthlySpend: 400 }),
        tool("cursor", { enabled: true, planId: "business", seats: 5, monthlySpend: 200 })
      ]
    }));

    expect(report.totalMonthlySpend).toBe(600);
    expect(report.isHighValue).toBe(true);
    expect(report.creditsOpportunity?.prominent).toBe(true);
  });

  test("unused seats: 10 seats for 5-person team flags waste", () => {
    const report = analyzeSpend(input({
      teamSize: 5,
      useCase: "Coding",
      tools: [tool("github-copilot", { enabled: true, planId: "individual", seats: 10, monthlySpend: 100 })]
    }));

    const finding = report.recommendations.find((recommendation) => recommendation.id === "github-copilot-unused-seats");
    expect(finding?.action).toContain("5 seats");
    expect(finding?.monthlySavings).toBe(50);
    expect(finding?.reason).toContain("5 likely unused seats");
  });

  test("API vs subscription: low API spend suggests subscription", () => {
    const report = analyzeSpend(input({
      teamSize: 1,
      useCase: "Writing",
      tools: [tool("anthropic-api", { enabled: true, planId: "monthly-spend", monthlySpend: 8 })]
    }));

    const finding = report.recommendations.find((recommendation) => recommendation.id === "anthropic-api-api-subscription-check");
    expect(finding?.action).toContain("Claude Pro");
    expect(finding?.action).toContain("$20/mo");
    expect(finding?.monthlySavings).toBe(0);
  });

  test("health score: perfect setup scores high", () => {
    const report = analyzeSpend(input({
      useCase: "Writing",
      tools: [tool("claude", { enabled: true, planId: "pro", monthlySpend: 20 })]
    }));

    expect(report.healthScore).toBeGreaterThanOrEqual(80);
  });

  test("savings calculation: monthly and annual both correct", () => {
    const report = analyzeSpend(input({
      teamSize: 2,
      useCase: "Coding",
      tools: [tool("github-copilot", { enabled: true, planId: "business", seats: 2, monthlySpend: 38 })]
    }));

    expect(report.totalAnnualSavings).toBe(report.totalMonthlySavings * 12);
    for (const recommendation of report.recommendations) {
      expect(recommendation.annualSavings).toBe(recommendation.monthlySavings * 12);
    }
  });

  test('zero spend: free tools only returns honest "no savings" report', () => {
    const report = analyzeSpend(input({
      teamSize: 1,
      useCase: "Writing",
      tools: [
        tool("claude", { enabled: true, planId: "free", monthlySpend: 0 }),
        tool("cursor", { enabled: true, planId: "hobby", monthlySpend: 0 }),
        tool("windsurf", { enabled: true, planId: "free", monthlySpend: 0 })
      ]
    }));

    expect(report.totalMonthlySavings).toBe(0);
    expect(report.summary).toContain("current AI cash spend is $0/mo");
  });

  test("annual savings display: large savings formatted correctly", () => {
    expect(formatAnnualSavings(1000)).toBe("$12,000/year");
  });
});
