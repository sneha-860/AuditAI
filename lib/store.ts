"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculateMonthlySpend, TOOLS } from "@/lib/pricing";
import type { AuditInput, ToolId, ToolInput } from "@/types";

interface AuditStore extends AuditInput {
  leadCaptureVisibleAt: number | null;
  setToolEnabled: (toolId: ToolId, enabled: boolean) => void;
  setToolPlan: (toolId: ToolId, planId: string) => void;
  setToolSeats: (toolId: ToolId, seats: number) => void;
  setToolMonthlySpend: (toolId: ToolId, monthlySpend: number) => void;
  setToolAvgTokensMonthly: (toolId: ToolId, avgTokensMonthly: number) => void;
  setTotalTeamSize: (totalTeamSize: number) => void;
  setPrimaryUseCase: (primaryUseCase: AuditInput["primaryUseCase"]) => void;
  setCompanyStage: (companyStage: AuditInput["companyStage"]) => void;
  markLeadCaptureVisible: () => void;
  getLeadCaptureVisibleForMs: () => number;
  getAuditInput: () => AuditInput;
}

const DEFAULT_PLAN_IDS: Record<ToolId, string> = {
  cursor: "pro",
  "github-copilot": "individual",
  claude: "pro",
  chatgpt: "plus",
  "anthropic-api": "monthly-spend",
  "openai-api": "monthly-spend",
  gemini: "pro",
  windsurf: "free"
};

function defaultPlanFor(toolId: ToolId): string {
  return DEFAULT_PLAN_IDS[toolId];
}

function normalizeTool(tool: Partial<ToolInput> | undefined, toolId: ToolId): ToolInput {
  const toolDefinition = TOOLS.find((candidate) => candidate.id === toolId);
  const persistedPlanId = tool?.planId;
  const hasValidPersistedPlan = toolDefinition?.plans.some((plan) => plan.id === persistedPlanId);
  const planId = tool?.enabled && hasValidPersistedPlan ? persistedPlanId! : defaultPlanFor(toolId);
  const seats = positiveInteger(tool?.seats ?? 1);
  const monthlySpend = calculateMonthlySpend(toolId, planId, seats);

  return {
    toolId,
    enabled: Boolean(tool?.enabled),
    planId,
    seats,
    monthlySpend,
    avgTokensMonthly: nonNegativeNumber(tool?.avgTokensMonthly ?? 0)
  };
}

function createInitialTools(): Record<ToolId, ToolInput> {
  return TOOLS.reduce<Record<ToolId, ToolInput>>((acc, tool) => {
    acc[tool.id] = normalizeTool(undefined, tool.id);

    return acc;
  }, {} as Record<ToolId, ToolInput>);
}

const initialState: AuditInput = {
  tools: createInitialTools(),
  totalTeamSize: 1,
  primaryUseCase: "Mixed",
  companyStage: "Early Startup (2-10)"
};

function nonNegativeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function positiveInteger(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      leadCaptureVisibleAt: null,
      setToolEnabled: (toolId, enabled) =>
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              ...state.tools[toolId],
              enabled
            }
          }
        })),
      setToolPlan: (toolId, planId) =>
        set((state) => {
          const current = state.tools[toolId];
          const monthlySpend = calculateMonthlySpend(toolId, planId, current.seats);

          return {
            tools: {
              ...state.tools,
              [toolId]: {
                ...current,
                planId,
                monthlySpend
              }
            }
          };
        }),
      setToolSeats: (toolId, seats) =>
        set((state) => {
          const normalizedSeats = positiveInteger(seats);
          const current = state.tools[toolId];
          const monthlySpend = calculateMonthlySpend(toolId, current.planId, normalizedSeats);
          const nextSpend = monthlySpend > 0 ? monthlySpend : current.monthlySpend;

          return {
            tools: {
              ...state.tools,
              [toolId]: {
                ...current,
                seats: normalizedSeats,
                monthlySpend: nextSpend
              }
            }
          };
        }),
      setToolMonthlySpend: (toolId, monthlySpend) =>
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              ...state.tools[toolId],
              monthlySpend: nonNegativeNumber(monthlySpend)
            }
          }
        })),
      setToolAvgTokensMonthly: (toolId, avgTokensMonthly) =>
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              ...state.tools[toolId],
              avgTokensMonthly: nonNegativeNumber(avgTokensMonthly)
            }
          }
        })),
      setTotalTeamSize: (totalTeamSize) => set({ totalTeamSize: positiveInteger(totalTeamSize) }),
      setPrimaryUseCase: (primaryUseCase) => set({ primaryUseCase }),
      setCompanyStage: (companyStage) => set({ companyStage }),
      markLeadCaptureVisible: () =>
        set((state) => ({
          leadCaptureVisibleAt: state.leadCaptureVisibleAt ?? Date.now()
        })),
      getLeadCaptureVisibleForMs: () => {
        const visibleAt = get().leadCaptureVisibleAt;
        return visibleAt ? Date.now() - visibleAt : 0;
      },
      getAuditInput: () => {
        const state = get();

        return {
          tools: state.tools,
          totalTeamSize: state.totalTeamSize,
          primaryUseCase: state.primaryUseCase,
          companyStage: state.companyStage
        };
      }
    }),
    {
      name: "credex-ai-spend-audit",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuditStore> | undefined;
        const persistedTools = (persisted?.tools ?? {}) as Partial<Record<ToolId, Partial<ToolInput>>>;

        return {
          ...currentState,
          ...persisted,
          tools: TOOLS.reduce<Record<ToolId, ToolInput>>((acc, tool) => {
            acc[tool.id] = normalizeTool(persistedTools[tool.id], tool.id);
            return acc;
          }, {} as Record<ToolId, ToolInput>)
        };
      }
    }
  )
);
