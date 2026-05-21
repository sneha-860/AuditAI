"use client";

import { create } from "zustand";
import { getPlan, getPlanMonthlyPrice, TOOL_MAP } from "@/lib/pricing";
import type { AuditInput, ToolId, ToolInput } from "@/types";

export type AuditStatus = "idle" | "calculating" | "done";

export interface AuditOverlapWarning {
  id: string;
  toolNames: [string, string];
  overlapPercent: number | null;
  suggestedDrop: string | null;
  monthlySaving: number;
  message: string;
}

export interface AuditResultRecommendation {
  toolName: string;
  action: string;
  monthlySaving: number;
}

export interface AuditResult {
  totalSpend: number;
  toolCount: number;
  savings: number;
  annualSavings: number;
  overlaps: AuditOverlapWarning[];
  recommendations: AuditResultRecommendation[];
}

interface AuditResultsStore {
  input: AuditInput | null;
  result: AuditResult | null;
  status: AuditStatus;
  runAudit: (input: AuditInput) => void;
  completeAudit: () => void;
  startOver: () => void;
}

type OverlapRule = {
  id: string;
  tools: [ToolId, ToolId];
  overlapPercent: number;
};

const OVERLAP_RULES: OverlapRule[] = [
  { id: "cursor-copilot", tools: ["cursor", "github-copilot"], overlapPercent: 80 },
  { id: "claude-chatgpt", tools: ["claude", "chatgpt"], overlapPercent: 70 }
];

const TEAM_PLAN_IDS = new Set(["team", "teams", "business"]);
const FREE_PLAN_IDS = new Set(["free", "hobby"]);

export const useAuditResultsStore = create<AuditResultsStore>((set) => ({
  input: null,
  result: null,
  status: "idle",
  runAudit: (input) => {
    const result = calculateAuditResult(input);

    set({ input, result, status: "calculating" });
  },
  completeAudit: () => set((state) => (state.result ? { status: "done" } : state)),
  startOver: () => {
    set({ input: null, result: null, status: "idle" });
  }
}));

function calculateAuditResult(input: AuditInput): AuditResult {
  const enabledTools = Object.values(input.tools).filter((tool) => tool.enabled);
  const costs = enabledTools.reduce<Partial<Record<ToolId, number>>>((acc, tool) => {
    acc[tool.toolId] = getToolMonthlyCost(tool);
    return acc;
  }, {});

  const droppedToolIds = new Set<ToolId>();
  const overlaps: AuditOverlapWarning[] = [];
  const recommendations: AuditResultRecommendation[] = [];

  for (const rule of OVERLAP_RULES) {
    const [firstToolId, secondToolId] = rule.tools;
    const firstTool = input.tools[firstToolId];
    const secondTool = input.tools[secondToolId];

    if (!firstTool?.enabled || !secondTool?.enabled) continue;

    const suggestedDrop = chooseToolToDrop(input, firstToolId, secondToolId, costs[firstToolId] ?? 0, costs[secondToolId] ?? 0);
    const saving = costs[suggestedDrop] ?? 0;
    const toolNames = [toolName(firstToolId), toolName(secondToolId)] as [string, string];
    const suggestedDropName = toolName(suggestedDrop);

    overlaps.push({
      id: rule.id,
      toolNames,
      overlapPercent: rule.overlapPercent,
      suggestedDrop: suggestedDropName,
      monthlySaving: saving,
      message: `${toolNames[0]} + ${toolNames[1]} overlap ${rule.overlapPercent}% - consider dropping ${suggestedDropName}`
    });

    if (!droppedToolIds.has(suggestedDrop)) {
      droppedToolIds.add(suggestedDrop);
      recommendations.push({
        toolName: suggestedDropName,
        action: `Drop ${suggestedDropName}`,
        monthlySaving: saving
      });
    }
  }

  if (input.tools["anthropic-api"]?.enabled && input.tools["openai-api"]?.enabled) {
    const suggestedApiDrop = chooseApiToDrop(input);
    const saving = suggestedApiDrop ? costs[suggestedApiDrop] ?? 0 : 0;

    overlaps.push({
      id: "both-apis",
      toolNames: [toolName("anthropic-api"), toolName("openai-api")],
      overlapPercent: null,
      suggestedDrop: suggestedApiDrop ? toolName(suggestedApiDrop) : null,
      monthlySaving: saving,
      message: suggestedApiDrop
        ? `${toolName("anthropic-api")} + ${toolName("openai-api")} both selected - ${input.primaryUseCase.toLowerCase()} teams can usually start by dropping ${toolName(suggestedApiDrop)}`
        : `${toolName("anthropic-api")} + ${toolName("openai-api")} both selected - compare workloads before keeping both APIs`
    });

    if (suggestedApiDrop && !droppedToolIds.has(suggestedApiDrop)) {
      droppedToolIds.add(suggestedApiDrop);
      recommendations.push({
        toolName: toolName(suggestedApiDrop),
        action: `Drop ${toolName(suggestedApiDrop)} API spend for this use case`,
        monthlySaving: saving
      });
    }
  }

  for (const tool of enabledTools) {
    if (droppedToolIds.has(tool.toolId)) continue;

    const plan = getPlan(tool.toolId, tool.planId);
    const price = getPlanMonthlyPrice(tool.toolId, tool.planId);
    const isSeatBased = price !== null && plan.billingModel !== "api";

    if (isSeatBased && tool.seats > input.totalTeamSize) {
      const unusedSeats = tool.seats - input.totalTeamSize;
      const saving = Number((unusedSeats * price).toFixed(2));

      recommendations.push({
        toolName: toolName(tool.toolId),
        action: `Reduce ${unusedSeats} unused seat${unusedSeats === 1 ? "" : "s"} for a ${input.totalTeamSize}-person team`,
        monthlySaving: saving
      });
    }

    if (isSeatBased && input.totalTeamSize <= 2 && TEAM_PLAN_IDS.has(tool.planId)) {
      recommendations.push({
        toolName: toolName(tool.toolId),
        action: `Review ${plan.name}; it may be oversized for ${input.companyStage}`,
        monthlySaving: Number((price * Math.max(1, tool.seats) * 0.25).toFixed(2))
      });
    }

    if (FREE_PLAN_IDS.has(tool.planId) && input.totalTeamSize >= 10) {
      recommendations.push({
        toolName: toolName(tool.toolId),
        action: `Validate whether the free plan still fits a ${input.companyStage} team`,
        monthlySaving: 0
      });
    }
  }

  const totalSpend = enabledTools.reduce((sum, tool) => sum + getToolMonthlyCost(tool), 0);
  const savings = recommendations.reduce((sum, recommendation) => sum + Math.max(0, recommendation.monthlySaving), 0);

  return {
    totalSpend,
    toolCount: enabledTools.length,
    savings,
    annualSavings: savings * 12,
    overlaps,
    recommendations
  };
}

function getToolMonthlyCost(tool: ToolInput): number {
  const plan = getPlan(tool.toolId, tool.planId);
  const price = getPlanMonthlyPrice(tool.toolId, tool.planId);

  if (plan.billingModel === "api" || price === null) {
    return nonNegativeNumber(tool.monthlySpend);
  }

  return Number((Math.max(1, tool.seats) * price).toFixed(2));
}

function chooseToolToDrop(input: AuditInput, firstToolId: ToolId, secondToolId: ToolId, firstCost: number, secondCost: number): ToolId {
  if (firstToolId === "cursor" && secondToolId === "github-copilot") return "github-copilot";
  if (firstToolId === "github-copilot" && secondToolId === "cursor") return "github-copilot";

  if ((firstToolId === "claude" && secondToolId === "chatgpt") || (firstToolId === "chatgpt" && secondToolId === "claude")) {
    if (input.primaryUseCase === "Writing" || input.primaryUseCase === "Research") return "chatgpt";
    if (input.primaryUseCase === "Data Analysis") return "claude";
  }

  if (firstCost < secondCost) return firstToolId;
  if (secondCost < firstCost) return secondToolId;
  if (firstToolId === "chatgpt" || secondToolId === "chatgpt") return "chatgpt";

  return secondToolId;
}

function chooseApiToDrop(input: AuditInput): ToolId | null {
  if (input.primaryUseCase === "Writing" || input.primaryUseCase === "Research") return "openai-api";
  if (input.primaryUseCase === "Data Analysis") return "anthropic-api";

  return null;
}

function toolName(toolId: ToolId): string {
  return TOOL_MAP[toolId].shortName;
}

function nonNegativeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
