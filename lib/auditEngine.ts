import { TOOL_MAP, TOOL_CAPABILITIES, getPlan, getPlanMonthlyPrice } from "@/lib/pricing";
import type {
  AuditInput,
  AuditRecommendation,
  AuditReport,
  RecommendationConfidence,
  ToolId,
  ToolInput,
  ToolResult
} from "@/types";

type EnabledTool = ToolInput & {
  name: string;
  planName: string;
  unitPrice: number | null;
};

type HealthDeductions = {
  redundantPairs: number;
  planMismatches: number;
  unusedSeatClusters: number;
  hasApiDirect: boolean;
};

const TEAM_OR_BUSINESS_PLANS = new Set(["team", "teams", "business"]);
const FREE_PLANS = new Set(["free", "hobby"]);
const API_PLAN_IDS = new Set(["api", "api-direct", "monthly-spend"]);
const RESEARCH_USE_CASES = new Set(["Research", "Mixed"]);

export function getEnabledTools(input: AuditInput): EnabledTool[] {
  return Object.values(input.tools)
    .filter((tool) => tool.enabled)
    .map((tool) => {
      const plan = getPlan(tool.toolId, tool.planId);

      return {
        ...tool,
        name: TOOL_MAP[tool.toolId].name,
        planName: plan.name,
        unitPrice: getPlanMonthlyPrice(tool.toolId, tool.planId)
      };
    });
}

export function analyzeSpend(input: AuditInput): AuditReport {
  const enabledTools = getEnabledTools(input);
  const recommendations: AuditRecommendation[] = [];
  const health: HealthDeductions = {
    redundantPairs: 0,
    planMismatches: 0,
    unusedSeatClusters: 0,
    hasApiDirect: false
  };

  for (const tool of enabledTools) {
    recommendations.push(...analyzePlanFit(tool, input, health));
  }

  recommendations.push(...analyzeRedundancy(enabledTools, input, health));
  recommendations.push(...analyzeAlternatives(enabledTools, input, health));

  const totalMonthlySpend = money(enabledTools.reduce((sum, tool) => sum + tool.monthlySpend, 0));
  const creditsOpportunity = buildCreditsOpportunity(enabledTools, totalMonthlySpend);
  const isHighValue = totalMonthlySpend > 500;

  if (creditsOpportunity?.eligible) {
    recommendations.push({
      id: "credex-credits",
      category: "credits",
      toolIds: enabledTools.map((tool) => tool.toolId),
      title: "Discounted credits opportunity",
      action: creditsOpportunity.prominent ? "Book a Credex consultation" : "Explore discounted AI credits",
      currentCost: totalMonthlySpend,
      recommendedCost: money(totalMonthlySpend * 0.8),
      monthlySavings: money(totalMonthlySpend * 0.2),
      annualSavings: money(totalMonthlySpend * 0.2 * 12),
      confidence: isHighValue ? "medium" : "low",
      reason: creditsOpportunity.message,
      severity: creditsOpportunity.prominent ? "action" : "minor"
    });
  }

  const totalMonthlySavings = money(recommendations.reduce((sum, rec) => sum + Math.max(0, rec.monthlySavings), 0));
  const toolResults = buildToolResults(enabledTools, recommendations);
  const healthScore = calculateHealthScore(health);

  return {
    totalMonthlySpend,
    totalAnnualSpend: money(totalMonthlySpend * 12),
    totalMonthlySavings,
    totalAnnualSavings: money(totalMonthlySavings * 12),
    isHighValue,
    healthScore,
    toolResults,
    recommendations,
    creditsOpportunity,
    summary: buildDeterministicSummary(totalMonthlySpend, totalMonthlySavings, healthScore, recommendations)
  };
}

export const calculateAudit = analyzeSpend;

function analyzePlanFit(tool: EnabledTool, input: AuditInput, health: HealthDeductions): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];
  const unitPrice = tool.unitPrice ?? safeUnitPrice(tool);

  if (API_PLAN_IDS.has(tool.planId) || TOOL_MAP[tool.toolId].category === "api") {
    health.hasApiDirect = true;
  }

  if (tool.seats <= 2 && TEAM_OR_BUSINESS_PLANS.has(tool.planId)) {
    const target = lowerPlanFor(tool.toolId);
    if (target) {
      const recommendedCost = money(target.monthly * tool.seats);
      const monthlySavings = money(tool.monthlySpend - recommendedCost);

      if (monthlySavings > 0) {
        health.planMismatches += 1;
        recommendations.push(createRecommendation({
          id: `${tool.toolId}-team-overkill`,
          category: "plan-fit",
          toolIds: [tool.toolId],
          title: `${tool.name} ${tool.planName} looks oversized`,
          action: `Switch to ${target.name}`,
          currentCost: tool.monthlySpend,
          recommendedCost,
          monthlySavings,
          confidence: "high",
          severity: "action",
          reason: `${tool.seats} user${tool.seats === 1 ? "" : "s"} on ${tool.name} ${tool.planName} costs ${usd(tool.monthlySpend)}/mo; ${target.name} would cost ${usd(recommendedCost)}/mo.`
        }));
      }
    }
  }

  if ((API_PLAN_IDS.has(tool.planId) || TOOL_MAP[tool.toolId].category === "api") && input.totalTeamSize > 0) {
    const spendPerUser = tool.monthlySpend / input.totalTeamSize;
    if (spendPerUser < 15 && tool.monthlySpend > 0) {
      const subscriptionCost = money(Math.min(input.totalTeamSize, Math.max(1, tool.seats)) * 20);
      const recommendedCost = Math.min(tool.monthlySpend, subscriptionCost);
      const isAnthropicWriting = tool.toolId === "anthropic-api" && input.primaryUseCase === "Writing";

      recommendations.push(createRecommendation({
        id: `${tool.toolId}-api-subscription-check`,
        category: "plan-fit",
        toolIds: [tool.toolId],
        title: isAnthropicWriting ? "Claude Pro may offer more value than light API spend" : `${tool.name} API usage is light`,
        action: isAnthropicWriting
          ? "Consider Claude Pro at $20/mo for more writing value"
          : subscriptionCost < tool.monthlySpend
            ? "Compare against per-seat subscriptions"
            : "Keep API direct for now",
        currentCost: tool.monthlySpend,
        recommendedCost,
        monthlySavings: money(tool.monthlySpend - recommendedCost),
        confidence: "low",
        severity: "minor",
        reason: isAnthropicWriting
          ? `${tool.name} is only ${usd(tool.monthlySpend)}/mo, below the $15/user/mo review threshold; Claude Pro at $20/mo may be the better writing workflow even when it does not reduce spend.`
          : `${tool.name} averages ${usd(spendPerUser)}/user/mo, below the $15/user/mo review threshold for API-versus-seat economics.`
      }));
    }
  }

  if (tool.seats > input.totalTeamSize && tool.seats > 1) {
    const likelyUnusedSeats = tool.seats - input.totalTeamSize;
    const recommendedCost = money(Math.max(1, tool.seats - likelyUnusedSeats) * unitPrice);
    const monthlySavings = money(tool.monthlySpend - recommendedCost);

    if (monthlySavings > 0) {
      health.unusedSeatClusters += 1;
      recommendations.push(createRecommendation({
        id: `${tool.toolId}-unused-seats`,
        category: "usage",
        toolIds: [tool.toolId],
        title: `${tool.name} may have unused seats`,
        action: `Review ${likelyUnusedSeats} seat${likelyUnusedSeats === 1 ? "" : "s"}`,
        currentCost: tool.monthlySpend,
        recommendedCost,
        monthlySavings,
        confidence: "medium",
        severity: "minor",
        reason: `${tool.seats} ${tool.name} seats for a ${input.totalTeamSize}-person team leaves ${likelyUnusedSeats} likely unused seat${likelyUnusedSeats === 1 ? "" : "s"}.`
      }));
    }
  }

  if (FREE_PLANS.has(tool.planId) && input.totalTeamSize > 3) {
    health.planMismatches += 1;
    recommendations.push(createRecommendation({
      id: `${tool.toolId}-free-collaboration-limit`,
      category: "plan-fit",
      toolIds: [tool.toolId],
      title: `${tool.name} Free may limit collaboration`,
      action: "Validate collaboration needs before scaling usage",
      currentCost: 0,
      recommendedCost: 0,
      monthlySavings: 0,
      confidence: "medium",
      severity: "minor",
      reason: `${input.totalTeamSize} people on a free ${tool.name} plan may create admin, billing, and collaboration gaps even if cash spend is currently $0.`
    }));
  }

  return recommendations;
}

function analyzeRedundancy(enabledTools: EnabledTool[], input: AuditInput, health: HealthDeductions): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];
  const byId = new Map(enabledTools.map((tool) => [tool.toolId, tool]));

  const cursor = byId.get("cursor");
  const copilot = byId.get("github-copilot");
  if (cursor && copilot && cursor.planId === "pro") {
    health.redundantPairs += 1;
    recommendations.push(dropToolRecommendation(copilot, [cursor.toolId, copilot.toolId], "Cursor Pro and GitHub Copilot both pay for coding assistance; keep the one your developers actually use in their IDE."));
  }

  const windsurf = byId.get("windsurf");
  if (cursor && windsurf) {
    health.redundantPairs += 1;
    const dropped = cursor.monthlySpend >= windsurf.monthlySpend ? windsurf : cursor;
    recommendations.push(dropToolRecommendation(dropped, [cursor.toolId, windsurf.toolId], "Windsurf and Cursor are both IDE assistants, so paying for both usually duplicates autocomplete and agentic-editing spend."));
  }

  const claude = byId.get("claude");
  const chatgpt = byId.get("chatgpt");
  if (claude && chatgpt && claude.planId === "pro" && chatgpt.planId === "plus" && !RESEARCH_USE_CASES.has(input.primaryUseCase)) {
    health.redundantPairs += 1;
    const dropped = claude.monthlySpend <= chatgpt.monthlySpend ? claude : chatgpt;
    recommendations.push(dropToolRecommendation(dropped, [claude.toolId, chatgpt.toolId], "Claude Pro and ChatGPT Plus overlap for non-research workflows; one general assistant is usually enough."));
  }

  const anthropicApi = byId.get("anthropic-api") ?? (claude?.planId === "api-direct" ? claude : undefined);
  const openaiApi = byId.get("openai-api") ?? (chatgpt?.planId === "api-direct" ? chatgpt : undefined);
  if (anthropicApi && openaiApi && input.primaryUseCase !== "Mixed") {
    health.redundantPairs += 1;
    const lowerCost = Math.min(anthropicApi.monthlySpend, openaiApi.monthlySpend);
    recommendations.push(createRecommendation({
      id: "api-provider-consolidation",
      category: "redundancy",
      toolIds: [anthropicApi.toolId, openaiApi.toolId],
      title: "Two API providers for one primary use case",
      action: "Consolidate routine traffic onto one default provider",
      currentCost: money(anthropicApi.monthlySpend + openaiApi.monthlySpend),
      recommendedCost: money(anthropicApi.monthlySpend + openaiApi.monthlySpend - lowerCost),
      monthlySavings: money(lowerCost),
      confidence: "medium",
      severity: "minor",
      reason: `${input.primaryUseCase} workloads can often standardize routine calls on one API provider while reserving the second for evals or fallback.`
    }));
  }

  return recommendations;
}

function analyzeAlternatives(enabledTools: EnabledTool[], input: AuditInput, health: HealthDeductions): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];
  const copilot = enabledTools.find((tool) => tool.toolId === "github-copilot");
  const chatgpt = enabledTools.find((tool) => tool.toolId === "chatgpt");
  const claude = enabledTools.find((tool) => tool.toolId === "claude");

  if (input.primaryUseCase === "Coding" && copilot?.planId === "business" && copilot.seats > 3) {
    recommendations.push(createRecommendation({
      id: "coding-value-ranking",
      category: "alternative",
      toolIds: [copilot.toolId],
      title: "Coding stack is reasonable but worth benchmarking",
      action: "Benchmark Cursor Business before renewal",
      currentCost: copilot.monthlySpend,
      recommendedCost: copilot.monthlySpend,
      monthlySavings: 0,
      confidence: "medium",
      severity: "minor",
      reason: "For coding-heavy teams, Cursor Pro, GitHub Copilot Individual, and Windsurf Pro are the best-value baseline; Cursor Business is comparable to Copilot Business for managed teams."
    }));
  }

  if (input.primaryUseCase === "Writing" && chatgpt?.planId === "plus" && !claude) {
    health.planMismatches += 1;
    recommendations.push(createRecommendation({
      id: "writing-claude-alternative",
      category: "alternative",
      toolIds: [chatgpt.toolId],
      title: "Claude Pro may fit writing better",
      action: "Test Claude Pro before renewing ChatGPT Plus",
      currentCost: chatgpt.monthlySpend,
      recommendedCost: chatgpt.monthlySpend,
      monthlySavings: 0,
      confidence: "medium",
      severity: "minor",
      reason: "Claude Pro and ChatGPT Plus are both $20/mo, but Claude is often the stronger finance-approved choice for long-form writing workflows."
    }));
  }

  return recommendations;
}

function buildToolResults(enabledTools: EnabledTool[], recommendations: AuditRecommendation[]): ToolResult[] {
  return enabledTools.map((tool) => {
    const relevant = recommendations
      .filter((rec) => rec.toolIds.includes(tool.toolId))
      .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

    if (!relevant || relevant.category === "credits") {
      return {
        toolId: tool.toolId,
        toolName: tool.name,
        planName: tool.planName,
        currentSpend: tool.monthlySpend,
        recommendedSpend: tool.monthlySpend,
        estimatedSavings: 0,
        recommendation: "Stay. Good fit.",
        status: "optimal",
        reason: `${tool.name} aligns with ${TOOL_CAPABILITIES[tool.toolId].strengths.slice(0, 2).join(" and ")} needs at the current spend level.`
      };
    }

    return {
      toolId: tool.toolId,
      toolName: tool.name,
      planName: tool.planName,
      currentSpend: tool.monthlySpend,
      recommendedSpend: relevant.recommendedCost,
      estimatedSavings: relevant.monthlySavings,
      recommendation: relevant.action,
      status: relevant.severity === "action" ? "action" : "minor",
      reason: relevant.reason
    };
  });
}

function buildCreditsOpportunity(enabledTools: EnabledTool[], totalMonthlySpend: number) {
  if (totalMonthlySpend <= 200) {
    return undefined;
  }

  const tools = enabledTools
    .filter((tool) => tool.monthlySpend > 0)
    .map((tool) => tool.name)
    .filter((toolName, index, names) => names.indexOf(toolName) === index);

  return {
    eligible: true,
    prominent: totalMonthlySpend > 500,
    tools,
    message: `Credex offers discounted credits for ${tools.join(", ")}. Potential additional 10-30% savings.`
  };
}

function calculateHealthScore(health: HealthDeductions): number {
  const score =
    100 -
    health.redundantPairs * 15 -
    health.planMismatches * 10 -
    health.unusedSeatClusters * 5 +
    (health.hasApiDirect ? 10 : 0);

  return Math.max(0, Math.min(100, score));
}

function buildDeterministicSummary(
  totalMonthlySpend: number,
  totalMonthlySavings: number,
  healthScore: number,
  recommendations: AuditRecommendation[]
): string {
  const actionCount = recommendations.filter((rec) => rec.monthlySavings > 0).length;

  if (totalMonthlySpend === 0) {
    return "Your current AI cash spend is $0/mo. The main audit risk is not overspend yet; it is making sure free plans do not block collaboration as the team scales.";
  }

  return `Your AI stack scores ${healthScore}/100, with ${usd(totalMonthlySavings)}/mo in identified savings across ${actionCount} recommendation${actionCount === 1 ? "" : "s"}. The biggest opportunities are plan fit, redundant coding assistants, and credit purchasing once monthly spend crosses procurement thresholds.`;
}

function dropToolRecommendation(tool: EnabledTool, toolIds: ToolId[], reason: string): AuditRecommendation {
  return createRecommendation({
    id: `${tool.toolId}-redundant-drop`,
    category: "redundancy",
    toolIds,
    title: `${tool.name} appears redundant`,
    action: `Drop ${tool.name} or keep only for active users`,
    currentCost: tool.monthlySpend,
    recommendedCost: 0,
    monthlySavings: tool.monthlySpend,
    confidence: "high",
    severity: "action",
    reason: `${reason} Dropping ${tool.name} saves ${usd(tool.monthlySpend)}/mo.`
  });
}

function lowerPlanFor(toolId: ToolId): { name: string; monthly: number } | undefined {
  const lowerPlans: Partial<Record<ToolId, { name: string; monthly: number }>> = {
    cursor: { name: "Pro", monthly: 20 },
    "github-copilot": { name: "Individual", monthly: 10 },
    claude: { name: "Pro", monthly: 20 },
    chatgpt: { name: "Plus", monthly: 20 },
    windsurf: { name: "Pro", monthly: 20 }
  };

  return lowerPlans[toolId];
}

function safeUnitPrice(tool: EnabledTool): number {
  if (tool.unitPrice !== null) {
    return tool.unitPrice;
  }

  return tool.seats > 0 ? tool.monthlySpend / tool.seats : tool.monthlySpend;
}

function createRecommendation(input: {
  id: string;
  category: AuditRecommendation["category"];
  toolIds: ToolId[];
  title: string;
  action: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  confidence: RecommendationConfidence;
  severity: AuditRecommendation["severity"];
  reason: string;
}): AuditRecommendation {
  const monthlySavings = money(Math.max(0, input.monthlySavings));

  return {
    ...input,
    currentCost: money(input.currentCost),
    recommendedCost: money(input.recommendedCost),
    monthlySavings,
    annualSavings: money(monthlySavings * 12)
  };
}

function money(value: number): number {
  return Number(value.toFixed(2));
}

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}
